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
    public class RentalAgreementsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RentalAgreementsController(AppDbContext context)
        {
            _context = context;
        }

        // 1. GET: api/RentalAgreements
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RentalAgreement>>> GetRentalAgreements()
        {
            return await _context.RentalAgreements.ToListAsync();
        }

        // 2. GET: api/RentalAgreements/5
        [HttpGet("{id}")]
        public async Task<ActionResult<RentalAgreement>> GetRentalAgreement(int id)
        {
            var agreement = await _context.RentalAgreements.FindAsync(id);

            if (agreement == null)
            {
                return NotFound(new { message = $"Rental Agreement with ID {id} not found." });
            }

            return agreement;
        }

        // 3. POST: api/RentalAgreements
        [HttpPost]
        public async Task<ActionResult<RentalAgreement>> PostRentalAgreement(RentalAgreement agreement)
        {
            var vehicleExists = await _context.Vehicles.AnyAsync(v => v.Id == agreement.VehicleId);
            if (!vehicleExists)
            {
                return BadRequest(new { message = $"Rental booking failed. Vehicle ID {agreement.VehicleId} is not registered." });
            }

            var customerExists = await _context.Users.AnyAsync(u => u.Id == agreement.CustomerId);
            if (!customerExists)
            {
                return BadRequest(new { message = $"Rental booking failed. Customer User ID {agreement.CustomerId} is not registered." });
            }

            _context.RentalAgreements.Add(agreement);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRentalAgreement), new { id = agreement.Id }, agreement);
        }

        // 4. PUT: api/RentalAgreements/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRentalAgreement(int id, RentalAgreement agreement)
        {
            if (id != agreement.Id)
            {
                return BadRequest(new { message = "ID mismatch between route parameter and request payload data." });
            }

            _context.Entry(agreement).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.RentalAgreements.AnyAsync(r => r.Id == id))
                {
                    return NotFound(new { message = $"Rental Agreement with ID {id} no longer exists." });
                }
                throw;
            }

            return Ok(new { message = "Vehicle rental lease agreement state updated successfully." });
        }

        // 5. DELETE: api/RentalAgreements/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRentalAgreement(int id)
        {
            var agreement = await _context.RentalAgreements.FindAsync(id);
            if (agreement == null)
            {
                return NotFound(new { message = $"Rental Agreement with ID {id} not found." });
            }

            _context.RentalAgreements.Remove(agreement);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Rental contract tracking instance {id} successfully deleted." });
        }
    }
}