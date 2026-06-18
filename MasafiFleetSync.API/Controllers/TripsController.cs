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
    public class TripsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TripsController(AppDbContext context)
        {
            _context = context;
        }

        // 1. GET: api/Trips (Fetch all recorded logistics trips)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Trip>>> GetTrips()
        {
            return await _context.Trips.ToListAsync();
        }

        // 2. GET: api/Trips/5 (Fetch specific route information)
        [HttpGet("{id}")]
        public async Task<ActionResult<Trip>> GetTrip(int id)
        {
            var trip = await _context.Trips.FindAsync(id);

            if (trip == null)
            {
                return NotFound(new { message = $"Trip record with ID {id} not found." });
            }

            return trip;
        }

        // 3. POST: api/Trips (Schedule a new optimized route assignment)
        [HttpPost]
        public async Task<ActionResult<Trip>> PostTrip(Trip trip)
        {
            // Validation: Ensure the assigned vehicle exists in fleet inventory
            var vehicleExists = await _context.Vehicles.AnyAsync(v => v.Id == trip.VehicleId);
            if (!vehicleExists)
            {
                return BadRequest(new { message = $"Assignment failed. Vehicle ID {trip.VehicleId} is not registered." });
            }

            // Validation: Ensure the assigned driver exists in personnel database
            var driverExists = await _context.Drivers.AnyAsync(d => d.Id == trip.DriverId);
            if (!driverExists)
            {
                return BadRequest(new { message = $"Assignment failed. Driver ID {trip.DriverId} is not registered." });
            }

            trip.Status = "Scheduled";
            _context.Trips.Add(trip);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTrip), new { id = trip.Id }, trip);
        }

        // 4. PUT: api/Trips/5 (Update trip progress, tracking metrics, or completion timestamps)
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTrip(int id, Trip trip)
        {
            if (id != trip.Id)
            {
                return BadRequest(new { message = "ID mismatch between route parameter and request body data." });
            }

            // State automation loops depending on logistics phase updates
            if (trip.Status.Equals("In Transit", StringComparison.OrdinalIgnoreCase) && trip.ActualStart == null)
            {
                trip.ActualStart = DateTime.UtcNow;
            }
            else if (trip.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase) && trip.ActualEnd == null)
            {
                trip.ActualEnd = DateTime.UtcNow;
            }

            _context.Entry(trip).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Trips.AnyAsync(t => t.Id == id))
                {
                    return NotFound(new { message = $"Trip with ID {id} no longer exists." });
                }
                throw;
            }

            return Ok(new { message = "Route optimization trip tracking state updated." });
        }

        // 5. DELETE: api/Trips/5 (Drop or cancel a scheduled trip log)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTrip(int id)
        {
            var trip = await _context.Trips.FindAsync(id);
            if (trip == null)
            {
                return NotFound(new { message = $"Trip record with ID {id} not found." });
            }

            _context.Trips.Remove(trip);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Trip record {id} successfully deleted from routing registry." });
        }
    }
}