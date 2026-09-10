using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MasafiFleetSync.API.Data;
using MasafiFleetSync.API.Models;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace MasafiFleetSync.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FinancialsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FinancialsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("ledger")]
        public async Task<ActionResult<FinancialDashboardDto>> GetFinancialLedger()
        {
            // Use local date/time evaluation to prevent timezone discrepancies with driver devices
            var today = DateTime.Now.Date;
            var startOfMonth = new DateTime(today.Year, today.Month, 1);

            // 1. Month-to-Date query & breakdown (capturing Completed or Delivered statuses)
            var mtdOrders = await _context.WaterOrders
                .Where(o => o.OrderTimestamp >= startOfMonth && (o.OrderStatus == "Completed" || o.OrderStatus == "Delivered"))
                .ToListAsync();

            var mtdRevenue = mtdOrders.Sum(o => o.GrossAmountAED);

            // 2. Fetch today's orders or any order that hasn't been fully settled yet
            var relevantOrders = await _context.WaterOrders
                .Where(o => o.OrderTimestamp.Date >= today || string.IsNullOrEmpty(o.CustodyStatus) || !o.CustodyStatus.Contains("Settled"))
                .ToListAsync();

            // 3. Resolve Driver profiles
            var allReferencedDriverIds = relevantOrders
                .Concat(mtdOrders)
                .Where(o => o.AssignedDriverId.HasValue)
                .Select(o => o.AssignedDriverId!.Value)
                .Distinct()
                .ToList();

            var drivers = await _context.Drivers
                .Where(d => allReferencedDriverIds.Contains(d.Id))
                .ToDictionaryAsync(d => d.Id);

            var ledgerEntries = new List<LedgerEntryDto>();
            decimal dailyGross = 0;
            decimal dailyCommission = 0;
            decimal dailyNet = 0;

            foreach (var order in relevantOrders)
            {
                if (order.OrderTimestamp.Date >= today)
                {
                    dailyGross += order.GrossAmountAED;
                    dailyCommission += order.CommissionDeductionAED;
                    dailyNet += order.DriverNetEarningsAED;
                }

                var driverName = order.AssignedDriverId.HasValue && drivers.ContainsKey(order.AssignedDriverId.Value)
                    ? drivers[order.AssignedDriverId.Value].Name
                    : "Unassigned/Unknown";

                var driverPhone = order.AssignedDriverId.HasValue && drivers.ContainsKey(order.AssignedDriverId.Value)
                    ? drivers[order.AssignedDriverId.Value].Phone
                    : "N/A";

                ledgerEntries.Add(new LedgerEntryDto
                {
                    Id = order.Id,
                    TransactionId = $"TXN-{order.Id}",
                    Driver = driverName,
                    Phone = driverPhone,
                    Volume = $"{order.VolumeGallons:N0} Gal",
                    Gross = order.GrossAmountAED,
                    Commission = order.CommissionDeductionAED,
                    Net = order.DriverNetEarningsAED,
                    State = string.IsNullOrEmpty(order.CustodyStatus) ? "Pending Collection" : order.CustodyStatus,
                    Timestamp = order.OrderTimestamp,
                    FormattedDate = order.OrderTimestamp.ToString("dd MMM, hh:mm tt")
                });
            }

            // Monthly Driver aggregates
            var monthlyContributors = mtdOrders
                .Where(o => o.AssignedDriverId.HasValue)
                .GroupBy(o => o.AssignedDriverId!.Value)
                .Select(g => new MonthlyContributorDto
                {
                    DriverName = drivers.ContainsKey(g.Key) ? drivers[g.Key].Name : "Unassigned",
                    TotalOrders = g.Count(),
                    TotalGross = g.Sum(x => x.GrossAmountAED),
                    TotalCommission = g.Sum(x => x.CommissionDeductionAED)
                })
                .OrderByDescending(c => c.TotalGross)
                .ToList();

            if (mtdRevenue < dailyGross)
            {
                mtdRevenue = dailyGross;
            }

            var result = new FinancialDashboardDto
            {
                TotalGrossToday = dailyGross,
                WeeklyAccumulatedRevenue = mtdRevenue,
                TotalCommissionToday = dailyCommission,
                TotalNetToday = dailyNet,
                CashLedger = ledgerEntries.OrderByDescending(l => l.Timestamp).ThenByDescending(l => l.Id).ToList(),
                MonthlyTopContributors = monthlyContributors,
                TotalMonthlyOrdersCount = mtdOrders.Count
            };

            return Ok(result);
        }

        [HttpPut("settle/{id}")]
        public async Task<IActionResult> SettleLedger(int id)
        {
            var order = await _context.WaterOrders.FindAsync(id);
            if (order == null) return NotFound();

            order.CustodyStatus = "Settled & Reconciled";

            // Robust pattern matching to securely bridge dynamic date-stamped IDs (e.g., "J-260903-29")
            string exactSuffix = $"-{id:D2}";
            string plainSuffix = $"-{id}";

            var deliveryRecord = await _context.DeliveryRecords
                .FirstOrDefaultAsync(d => d.Id == id ||
                                          d.JobReference == id.ToString() ||
                                          d.JobReference == $"TXN-{id}" ||
                                          d.JobReference == $"J-{id}" ||
                                          d.JobReference.EndsWith(exactSuffix) ||
                                          d.JobReference.EndsWith(plainSuffix));

            if (deliveryRecord != null)
            {
                deliveryRecord.Status = "Settled & Reconciled";
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}