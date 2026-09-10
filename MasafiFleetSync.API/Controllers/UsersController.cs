using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MasafiFleetSync.API.Data;
using MasafiFleetSync.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using BCrypt.Net;

namespace MasafiFleetSync.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // 1. GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // 2. GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = $"User with ID {id} not found." });
            }
            return user;
        }

        // 3. POST: api/Users
        [HttpPost]
        public async Task<ActionResult<User>> PostUser(User user)
        {
            bool emailExists = await _context.Users.AnyAsync(u => u.Email == user.Email.ToLower());
            if (emailExists)
            {
                return BadRequest(new { message = $"A user account with email '{user.Email}' already exists." });
            }

            // Securely hash password using BCrypt
            if (!string.IsNullOrEmpty(user.PasswordHash))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
            }
            else
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword("DefaultPassword123!");
            }

            user.Email = user.Email.ToLower();
            user.FullName = string.IsNullOrEmpty(user.FullName) ? "New Staff User" : user.FullName;
            user.AccountStatus = string.IsNullOrEmpty(user.AccountStatus) ? "Active" : user.AccountStatus;
            user.Role = string.IsNullOrEmpty(user.Role) ? "Dispatcher / Operator" : user.Role;

            // Safely generate a unique phone number using standard Substring to prevent unique index constraint violations
            string ticks = DateTime.UtcNow.Ticks.ToString();
            user.PhoneNumber = string.IsNullOrEmpty(user.PhoneNumber) || user.PhoneNumber == "0000000000"
                ? "9" + ticks.Substring(ticks.Length - 9)
                : user.PhoneNumber;

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Automatically provision a corresponding Driver record if the registered role is a Driver
            if (user.Role.Equals("Driver", StringComparison.OrdinalIgnoreCase))
            {
                // FIXED: Changed d.Id == user.Id to check by Email to prevent cross-wiring
                bool driverExists = await _context.Drivers.AnyAsync(d => d.Email.ToLower() == user.Email.ToLower());
                if (!driverExists)
                {
                    var driverRecord = new Driver
                    {
                        // FIXED: Removed "Id = user.Id" to stop forcing mismatched IDs and let SQL auto-increment handle it
                        Name = user.FullName,
                        Email = user.Email,
                        Phone = user.PhoneNumber,
                        LicenseNumber = $"DL-{user.Id:D5}",
                        Status = "Active",
                        ComplianceStatus = "Non-Compliant"
                    };
                    _context.Drivers.Add(driverRecord);
                    await _context.SaveChangesAsync();
                }
            }

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }

        // 4. PUT: api/Users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(int id, User user)
        {
            if (id != user.Id)
            {
                return BadRequest(new { message = "ID mismatch between route parameter and request body data." });
            }

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Users.AnyAsync(u => u.Id == id))
                {
                    return NotFound(new { message = $"User with ID {id} no longer exists." });
                }
                throw;
            }

            return Ok(new { message = "User profile configuration updated successfully." });
        }

        // 5. PUT: api/Users/5/profile (Persistent Name and Email Update with duplicate-email prevention & error handling)
        [HttpPut("{id}/profile")]
        public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateProfileRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = $"User with ID {id} not found." });
            }

            if (!string.IsNullOrEmpty(request.Email))
            {
                string targetEmail = request.Email.ToLower();
                bool emailExists = await _context.Users.AnyAsync(u => u.Email == targetEmail && u.Id != id);
                if (emailExists)
                {
                    return BadRequest(new { message = "This email address is already registered by another user." });
                }
                user.Email = targetEmail;
            }

            user.FullName = request.FullName;

            // FIXED: Sync with Driver record by matching EMAIL, NOT ID. This stops Tamim from overwriting Khalid's name.
            var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.Email.ToLower() == user.Email.ToLower());
            if (driver != null)
            {
                driver.Name = request.FullName;
                if (!string.IsNullOrEmpty(request.Email))
                {
                    driver.Email = request.Email.ToLower();
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database error while updating profile.", details = ex.InnerException?.Message ?? ex.Message });
            }

            return Ok(new { message = "Profile updated successfully in database." });
        }

        // 6. PUT: api/Users/5/password
        [HttpPut("{id}/password")]
        public async Task<IActionResult> UpdatePassword(int id, [FromBody] UpdatePasswordRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = $"User with ID {id} not found." });
            }

            // Allow bypass if called via recovery (empty current password) or check hash
            if (!string.IsNullOrEmpty(request.CurrentPassword))
            {
                if (!string.IsNullOrEmpty(user.PasswordHash))
                {
                    bool isValid = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash);
                    if (!isValid)
                    {
                        return BadRequest(new { message = "The current password provided is incorrect." });
                    }
                }
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password updated successfully in database." });
        }

        // 7. DELETE: api/Users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = $"User with ID {id} not found." });
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"User account profile for {user.FullName} successfully deleted." });
        }
    }

    public class UpdatePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class UpdateProfileRequest
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}