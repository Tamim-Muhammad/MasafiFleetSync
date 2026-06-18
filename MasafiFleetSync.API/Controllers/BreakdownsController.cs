using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MasafiFleetSync.API.Data;
using MasafiFleetSync.API.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MasafiFleetSync.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BreakdownsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BreakdownsController(AppDbContext context)
        {
            _context = context;
        }

        // 1. GET: api/Breakdowns (Fetch all breakdown records)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Breakdown>>> GetBreakdowns()
        {
            return await _context.Breakdowns.ToListAsync();
        }

        // 2. GET: api/Breakdowns/5 (Fetch a specific breakdown incident)
        [HttpGet("{id}")]
        public async Task<ActionResult<Breakdown>> GetBreakdown(int id)
        {
            var breakdown = await _context.Breakdowns.FindAsync(id);

            if (breakdown == null)
            {
                return NotFound(new { message = $"Breakdown log with ID {id} not found." });
            }

            return breakdown;
        }

        // 3. POST: api/Breakdowns (Report a new vehicle breakdown)
        [HttpPost]
        public async Task<ActionResult<Breakdown>> PostBreakdown(Breakdown breakdown)
        {
            // Optional Validation: Check if the vehicle actually exists before logging a breakdown
            var vehicleExists = await _context.Vehicles.AnyAsync(v => v.Id == breakdown.VehicleId);
            if (!vehicleExists)
            {
                return BadRequest(new { message = $"Cannot report breakdown. Vehicle ID {breakdown.VehicleId} does not exist in the fleet registry." });
            }

            breakdown.ReportedAt = DateTime.UtcNow; // Force exact server time
            _context.Breakdowns.Add(breakdown);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBreakdown), new { id = breakdown.Id }, breakdown);
        }

        // 4. PUT: api/Breakdowns/5 (Update severity, status, or add resolution timestamp)
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBreakdown(int id, Breakdown breakdown)
        {
            if (id != breakdown.Id)
            {
                return BadRequest(new { message = "ID mismatch between route parameter and request body data." });
            }

            // If the status is being set to Resolved, automatically stamp the resolution time if not provided
            if (breakdown.Status.Equals("Resolved", StringComparison.OrdinalIgnoreCase) && breakdown.ResolvedAt == null)
            {
                breakdown.ResolvedAt = DateTime.UtcNow;
            }

            _context.Entry(breakdown).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Breakdowns.AnyAsync(b => b.Id == id))
                {
                    return NotFound(new { message = $"Breakdown log with ID {id} no longer exists." });
                }
                throw;
            }

            return Ok(new { message = "Breakdown incident logs updated successfully." });
        }

        // 5. DELETE: api/Breakdowns/5 (Remove an accidental or archival log entry)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBreakdown(int id)
        {
            var breakdown = await _context.Breakdowns.FindAsync(id);
            if (breakdown == null)
            {
                return NotFound(new { message = $"Breakdown log with ID {id} not found." });
            }

            _context.Breakdowns.Remove(breakdown);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Breakdown incident record {id} successfully dropped from history." });
        }
    }
}