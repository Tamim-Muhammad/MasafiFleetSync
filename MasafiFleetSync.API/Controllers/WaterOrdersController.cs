using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MasafiFleetSync.API.Data;
using MasafiFleetSync.API.Models;
using System;
using System.Threading.Tasks;

namespace MasafiFleetSync.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WaterOrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WaterOrdersController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/waterorders/calculate-fare
        [HttpPost("calculate-fare")]
        public async Task<IActionResult> CalculateFare([FromBody] FareCalculationRequest request)
        {
            // Pull the single live admin configuration row from settings table (Screen 25)
            var config = await _context.SystemConfigs.FirstOrDefaultAsync();
            if (config == null)
            {
                return StatusCode(500, "Core baseline pricing variables are uninitialized in system settings.");
            }

            // Business core mathematical calculation script formula: [Base + (Distance * PerKm)] * Multiplier
            decimal baseCalculation = config.BaseRate + (request.DistanceKm * config.PerKmRate);
            decimal grossTotal = baseCalculation * request.VolumeMultiplier;

            decimal commissionCut = grossTotal * (config.CompanyCommissionPercentage / 100m);
            decimal driverNet = grossTotal - commissionCut;

            return Ok(new
            {
                GrossAmountAED = Math.Round(grossTotal, 2),
                CommissionDeductionAED = Math.Round(commissionCut, 2),
                DriverNetEarningsAED = Math.Round(driverNet, 2)
            });
        }

        // POST: api/waterorders/create
        [HttpPost("create")]
        public async Task<IActionResult> CreateOrder([FromBody] WaterOrder order)
        {
            if (order == null) return BadRequest("Order dataset payload cannot be null.");

            order.OrderTimestamp = DateTime.UtcNow;
            order.CustodyStatus = "PendingCollection"; // Injects state 1 of hand-to-hand ledger tracking
            order.OrderStatus = "Pending";

            _context.WaterOrders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Bulk water dispatch request logged successfully.", OrderId = order.Id });
        }
    }

    public class FareCalculationRequest
    {
        public decimal DistanceKm { get; set; } // Generated dynamically via Google Distance Matrix API
        public decimal VolumeMultiplier { get; set; } // Scale factor tracking 1,000 Gallons vs 5,000 Gallon Tankers
    }
}