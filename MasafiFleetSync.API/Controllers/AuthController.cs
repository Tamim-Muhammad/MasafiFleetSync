using BCrypt.Net;
using MasafiFleetSync.API.Data;
using MasafiFleetSync.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MasafiFleetSync.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // --- REGISTRATION ---
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (request.VerificationCode != "123456") return BadRequest(new { message = "Invalid verification code." });
            if (await _context.Users.AnyAsync(u => u.Email == request.Email.ToLower()))
                return BadRequest(new { message = "Email already registered." });

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var newUser = new User
            {
                FullName = request.FullName,
                Email = request.Email.ToLower(),
                PhoneNumber = request.PhoneNumber,
                PasswordHash = passwordHash,
                Role = "Customer",
                AccountStatus = "Active"
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Registration successful! You can now log in." });
        }

        // --- LOGIN ---
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Updated query to check Email OR PhoneNumber
            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.Email == request.Email.ToLower() || u.PhoneNumber == request.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid credentials." });

            if (user.AccountStatus != "Active")
                return Unauthorized(new { message = "Account is not active." });

            var token = GenerateJwtToken(user);

            return Ok(new { token = token, role = user.Role, message = "Login successful." });
        }

        // --- HELPER: JWT GENERATION ---
        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var jwtKey = _configuration["Jwt:Key"] ?? "YourSuperSecretKeyMustBeAtLeast32CharactersLong";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}