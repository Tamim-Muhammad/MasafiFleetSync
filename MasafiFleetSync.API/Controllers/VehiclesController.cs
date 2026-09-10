using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MasafiFleetSync.API.Data;
using MasafiFleetSync.API.Models;

namespace MasafiFleetSync.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VehiclesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VehiclesController(AppDbContext context)
        {
            _context = context;
        }

        // 1. GET: api/Vehicles
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Vehicle>>> GetVehicles()
        {
            return await _context.Vehicles.ToListAsync();
        }

        // 2. GET: api/Vehicles/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Vehicle>> GetVehicle(int id)
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null)
            {
                return NotFound(new { message = $"Vehicle with ID {id} not found." });
            }
            return vehicle;
        }

        // 3. POST: api/Vehicles
        [HttpPost]
        public async Task<ActionResult<Vehicle>> PostVehicle(Vehicle vehicle)
        {
            bool exists = await _context.Vehicles.AnyAsync(v => v.VehicleNumber == vehicle.VehicleNumber);
            if (exists)
            {
                return BadRequest(new { message = $"A vehicle with number '{vehicle.VehicleNumber}' already exists in the system." });
            }

            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetVehicle), new { id = vehicle.Id }, vehicle);
        }

        // 4. PUT: api/Vehicles/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutVehicle(int id, Vehicle vehicle)
        {
            id = vehicle.Id; // Safety guard for route vs body mismatches
            _context.Entry(vehicle).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Vehicles.AnyAsync(v => v.Id == id))
                {
                    return NotFound(new { message = $"Vehicle with ID {id} no longer exists." });
                }
                throw;
            }

            return Ok(new { message = "Vehicle asset updated successfully." });
        }

        // 5. PUT: api/Vehicles/5/blockade (Enforce or Lift Regulatory Blockade)
        [HttpPut("{id}/blockade")]
        public async Task<IActionResult> ToggleBlockade(int id)
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null)
            {
                return NotFound(new { message = $"Vehicle with ID {id} not found." });
            }

            if (string.Equals(vehicle.Status, "Blockaded", StringComparison.OrdinalIgnoreCase))
            {
                vehicle.Status = "Available";
                vehicle.IsCompliant = true;
            }
            else
            {
                vehicle.Status = "Blockaded";
                vehicle.IsCompliant = false;
            }

            await _context.SaveChangesAsync();
            return Ok(new
            {
                message = $"Vehicle {vehicle.VehicleNumber} status successfully updated to {vehicle.Status}.",
                status = vehicle.Status,
                isCompliant = vehicle.IsCompliant
            });
        }

        // 6. DELETE: api/Vehicles/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVehicle(int id)
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null)
            {
                return NotFound(new { message = $"Vehicle with ID {id} not found." });
            }

            _context.Vehicles.Remove(vehicle);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Vehicle asset {vehicle.VehicleNumber} successfully deleted." });
        }
    }
}