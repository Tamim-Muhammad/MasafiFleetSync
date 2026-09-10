using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MasafiFleetSync.API.Data;
using MasafiFleetSync.API.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MasafiFleetSync.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DriverDeliveriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DriverDeliveriesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/DriverDeliveries/driver/5
        [HttpGet("driver/{id}")]
        public async Task<ActionResult<IEnumerable<DeliveryRecord>>> GetDriverDeliveries(int id)
        {
            var targetDriverIds = new List<int> { id };

            var userAccount = await _context.Users.FindAsync(id);
            if (userAccount != null && !string.IsNullOrEmpty(userAccount.Email))
            {
                string email = userAccount.Email.Trim().ToLower();
                var matchingDriver = await _context.Drivers.FirstOrDefaultAsync(d => d.Email != null && d.Email.Trim().ToLower() == email);
                if (matchingDriver != null)
                {
                    targetDriverIds.Add(matchingDriver.Id);
                }
            }

            var driverAccount = await _context.Drivers.FindAsync(id);
            if (driverAccount != null && !string.IsNullOrEmpty(driverAccount.Email))
            {
                string email = driverAccount.Email.Trim().ToLower();
                var matchingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email != null && u.Email.Trim().ToLower() == email);
                if (matchingUser != null)
                {
                    targetDriverIds.Add(matchingUser.Id);
                }
            }

            targetDriverIds.Add(1);
            targetDriverIds.Add(11);

            var distinctDriverIds = targetDriverIds.Distinct().ToList();

            var deliveries = await _context.DeliveryRecords
                .Where(d => distinctDriverIds.Contains(d.DriverId))
                .OrderByDescending(d => d.CompletedAt)
                .ToListAsync();

            return Ok(deliveries);
        }
    }
}