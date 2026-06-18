using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MasafiFleetSync.API.Data;
using MasafiFleetSync.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MasafiFleetSync.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VehiclesController : ControllerBase
    {
        private readonly AppDbContext _context;

        // Dependency Injection: Injecting our verified AppDbContext database hub
        public VehiclesController(AppDbContext context)
        {
            _context = context;
        }

        // 1. GET: api/Vehicles (Fetch all fleet assets)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Vehicle>>> GetVehicles()
        {
            return await _context.Vehicles.ToListAsync();
        }

        // 2. GET: api/Vehicles/5 (Fetch a single vehicle asset by its Primary Key)
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

        // 3. POST: api/Vehicles (Add a brand new vehicle to the registry)
        [HttpPost]
        public async Task<ActionResult<Vehicle>> PostVehicle(Vehicle vehicle)
        {
            // Simple validation: Avoid duplicate license plates in the active fleet
            bool exists = await _context.Vehicles.AnyAsync(v => v.VehicleNumber == vehicle.VehicleNumber);
            if (exists)
            {
                return BadRequest(new { message = $"A vehicle with number '{vehicle.VehicleNumber}' already exists in the system." });
            }

            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetVehicle), new { id = vehicle.Id }, vehicle);
        }

        // 4. PUT: api/Vehicles/5 (Update registration, status, or structural details)
        [HttpPut("{id}")]
        public async Task<IActionResult> PutVehicle(int id, Vehicle vehicle)
        {
            if (id != vehicle.Id)
            {
                return BadRequest(new { message = "ID mismatch between route parameter and vehicle body data." });
            }

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

        // 5. DELETE: api/Vehicles/5 (Decommission or remove a vehicle from tracking)
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