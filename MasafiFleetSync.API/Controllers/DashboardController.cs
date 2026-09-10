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
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("summary")]
        public async Task<ActionResult<DashboardSummaryDto>> GetDashboardSummary()
        {
            var today = DateTime.UtcNow.Date;

            // 1. Calculate Total Fleet Revenue (Water Completed + Rental Completed/Active)
            var waterRevenue = await _context.WaterOrders
                .Where(o => o.OrderStatus == "Completed")
                .SumAsync(o => (decimal?)o.GrossAmountAED) ?? 0m;

            var rentalRevenue = await _context.RentalAgreements
                .Where(r => r.Status == "Completed" || r.Status == "Active")
                .SumAsync(r => (decimal?)r.TotalPrice) ?? 0m;

            // 2. Compliance Alerts (Mulkiya / Registration Expiries) - Including Already Expired/Past Dates
            var expiredAssets = await _context.Vehicles
                .CountAsync(v => v.RegistrationExpiryDate < today);

            var criticalAssets = await _context.Vehicles
                .CountAsync(v => v.RegistrationExpiryDate <= today.AddDays(7) && v.RegistrationExpiryDate >= today);

            // Total Critical Risk count includes both past-due/expired assets and 0-7 day window assets
            int totalCriticalRiskCount = expiredAssets + criticalAssets;

            var warningAssets = await _context.Vehicles
                .CountAsync(v => v.RegistrationExpiryDate > today.AddDays(7) && v.RegistrationExpiryDate <= today.AddDays(15));

            var upcomingAssets = await _context.Vehicles
                .CountAsync(v => v.RegistrationExpiryDate > today.AddDays(15) && v.RegistrationExpiryDate <= today.AddDays(30));

            // 3. Dynamic Tanker Utilization & Compliance Counts with Denominators
            var totalVehicles = await _context.Vehicles.CountAsync();

            var activeVehicles = await _context.Vehicles
                .CountAsync(v => v.Status == "In-Transit" ||
                                 v.Status == "On-Job" ||
                                 v.Status == "Active" ||
                                 v.Status == "Dispatched" ||
                                 v.Status == "Rented");

            var fullyCompliantAssets = Math.Max(0, totalVehicles - expiredAssets - criticalAssets);

            decimal utilizationPct = totalVehicles > 0
                ? Math.Round(((decimal)activeVehicles / totalVehicles) * 100, 1)
                : 0m;

            decimal compliancePct = totalVehicles > 0
                ? Math.Round(((decimal)fullyCompliantAssets / totalVehicles) * 100, 1)
                : 100m;

            // 4. Live Active Breakdown / SOS Incidents Count from EmergencyIncidents
            var activeCrisesCount = await _context.EmergencyIncidents
                .CountAsync(e => e.Status != "Resolved" && e.Status != "Incident Resolved");

            // 5. Weekly Chart Data (Last 7 Days) - Filtered strictly to current rolling week timestamps to prevent historical seed inflation
            var chartData = new List<ChartDataDto>();
            for (int i = 6; i >= 0; i--)
            {
                var targetDate = today.AddDays(-i).Date;

                var dailyWaterVolume = await _context.WaterOrders
                    .Where(o => o.OrderTimestamp.Date == targetDate && o.OrderStatus == "Completed" && o.OrderTimestamp.Date >= today.AddDays(-6))
                    .SumAsync(o => (int?)o.VolumeGallons) ?? 0;

                var dailyWaterRev = await _context.WaterOrders
                    .Where(o => o.OrderTimestamp.Date == targetDate && o.OrderStatus == "Completed" && o.OrderTimestamp.Date >= today.AddDays(-6))
                    .SumAsync(o => (decimal?)o.GrossAmountAED) ?? 0m;

                var dailyLeaseRev = await _context.RentalAgreements
                    .Where(r => r.StartDate.Date == targetDate && (r.Status == "Completed" || r.Status == "Active") && r.StartDate.Date >= today.AddDays(-6))
                    .SumAsync(r => (decimal?)r.TotalPrice) ?? 0m;

                chartData.Add(new ChartDataDto
                {
                    Day = targetDate.ToString("ddd"),
                    WaterDeliveriesVolume = dailyWaterVolume,
                    LeasingRevenue = dailyLeaseRev,
                    TotalRevenue = dailyWaterRev + dailyLeaseRev
                });
            }

            // 6. Compile Response
            var summary = new DashboardSummaryDto
            {
                TotalRevenue = waterRevenue + rentalRevenue,
                UtilizationPercentage = utilizationPct,
                ActiveVehiclesCount = activeVehicles,
                TotalVehiclesCount = totalVehicles,
                GlobalComplianceRate = compliancePct,
                CompliantVehiclesCount = fullyCompliantAssets,
                ActiveCrisesCount = activeCrisesCount,
                ComplianceAlerts = new ComplianceAlertsDto
                {
                    CriticalCount = totalCriticalRiskCount, // Unified to include already expired + 0-7 days warning window matching the compliance center table
                    WarningCount = warningAssets,
                    UpcomingCount = upcomingAssets
                },
                WeeklyPerformance = chartData
            };

            return Ok(summary);
        }
    }
}