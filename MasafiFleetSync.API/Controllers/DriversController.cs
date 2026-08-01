using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MasafiFleetSync.API.Data;
using MasafiFleetSync.API.Models;

namespace MasafiFleetSync.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DriversController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DriversController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/drivers/register
        [HttpPost("register")]
        public async Task<ActionResult<Driver>> RegisterDriver([FromBody] RegisterDriverRequest request)
        {
            // 1. Hardcoded OTP Validation
            if (request.Otp != "123456")
            {
                return BadRequest(new { message = "Invalid OTP. Please use 123456." });
            }

            // 2. Compliance Logic: Check License Expiry
            // Block registration if license is expired
            if (request.LicenseExpiryDate.Date < DateTime.Today)
            {
                return BadRequest(new { message = "Registration denied: The provided driving license has expired." });
            }

            var driver = new Driver
            {
                Name = request.Name,
                Email = request.Email,
                Phone = request.Phone,
                EmergencyPhone = request.EmergencyPhone,
                Otp = request.Otp,

                LicenseNumber = request.LicenseNumber,
                LicenseExpiryDate = request.LicenseExpiryDate,
                LicenseIssuingAuthority = request.LicenseIssuingAuthority,

                VehicleAssignment = request.VehicleAssignment,
                PlateNumber = request.PlateNumber,
                ChassisNumber = request.ChassisNumber,

                // Professional Onboarding Defaults
                DrivingLicenseDocumentUrl = "pending",
                DocumentCopyUrl = "pending",
                Status = "Pending Approval",
                ComplianceStatus = "Non-Compliant"
            };

            _context.Drivers.Add(driver);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDriver), new { id = driver.Id }, driver);
        }

        // GET: api/drivers/pending
        // Used by Admin Compliance Dashboard to list only new registrations
        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<Driver>>> GetPendingDrivers()
        {
            return await _context.Drivers
                .Where(d => d.Status == "Pending Approval")
                .ToListAsync();
        }

        // GET: api/drivers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Driver>>> GetDrivers()
        {
            return await _context.Drivers.ToListAsync();
        }

        // GET: api/drivers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Driver>> GetDriver(int id)
        {
            var driver = await _context.Drivers.FindAsync(id);
            if (driver == null) return NotFound(new { message = $"Driver with ID {id} not found." });
            return Ok(driver);
        }

        // POST: api/drivers
        [HttpPost]
        public async Task<ActionResult<Driver>> CreateDriver(Driver driver)
        {
            _context.Drivers.Add(driver);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetDriver), new { id = driver.Id }, driver);
        }

        // PUT: api/drivers/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDriver(int id, Driver driver)
        {
            if (id != driver.Id) return BadRequest(new { message = "ID mismatch." });
            _context.Entry(driver).State = EntityState.Modified;
            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Drivers.Any(e => e.Id == id)) return NotFound();
                else throw;
            }
            return NoContent();
        }

        // DELETE: api/drivers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDriver(int id)
        {
            var driver = await _context.Drivers.FindAsync(id);
            if (driver == null) return NotFound();
            _context.Drivers.Remove(driver);
            await _context.SaveChangesAsync();
            return Ok(new { message = $"Driver with ID {id} removed." });
        }
    }
}