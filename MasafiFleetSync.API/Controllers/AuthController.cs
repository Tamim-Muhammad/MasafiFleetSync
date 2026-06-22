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
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.LoginInput) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest("Login input fields cannot be empty.");
            }

            // Cleanly look up user by matching either Email OR Phone Number (Unified Field Entry)
            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.Email.ToLower() == request.LoginInput.ToLower() || u.PhoneNumber == request.LoginInput);

            if (user == null)
            {
                return Unauthorized("Invalid credentials provided.");
            }

            // Brute-force protection lockout check (US#20)
            if (user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTime.UtcNow)
            {
                return StatusCode(423, $"Account locked due to multiple failed attempts. Try again after {user.LockoutEnd.Value:HH:mm} UTC.");
            }

            // In production, use BCrypt/Identity password hashing verification. Checking baseline string equality for scaffolding:
            if (user.PasswordHash != request.Password)
            {
                user.FailedLoginAttempts++;
                if (user.FailedLoginAttempts >= 5)
                {
                    user.LockoutEnd = DateTime.UtcNow.AddMinutes(15);
                    user.FailedLoginAttempts = 0; // Reset counter for post-lockout attempt window
                }
                await _context.SaveChangesAsync();
                return Unauthorized("Invalid credentials provided.");
            }

            // Safety gate check
            if (user.AccountStatus == "Suspended")
            {
                return StatusCode(403, "Access denied. This profile has been suspended by Al-Waqar operations.");
            }

            // Reset tracking parameters upon successful auth transaction
            user.FailedLoginAttempts = 0;
            user.LockoutEnd = null;
            await _context.SaveChangesAsync();

            // Return core payload context directly into React App Router
            return Ok(new
            {
                UserId = user.Id,
                Name = user.FullName,
                Role = user.Role, // Customer, Driver, Dispatcher, SuperAdmin
                Status = user.AccountStatus
            });
        }
    }

    public class LoginRequest
    {
        public string LoginInput { get; set; } = string.Empty; // Holds email or phone payload string
        public string Password { get; set; } = string.Empty;
    }
}