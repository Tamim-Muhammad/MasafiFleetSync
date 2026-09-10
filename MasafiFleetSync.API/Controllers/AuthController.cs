using BCrypt.Net;
using MasafiFleetSync.API.Data;
using MasafiFleetSync.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Net;
using System.Net.Mail;
using System.Collections.Concurrent;

namespace MasafiFleetSync.API.Controllers
{
    public class ChangePasswordRequest
    {
        public int UserId { get; set; }
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class SendOtpRequest
    {
        public string Email { get; set; } = string.Empty;
    }

    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        // In-memory temporary store for active OTP codes made public so DriversController can access it
        public static readonly ConcurrentDictionary<string, string> OtpStorage = new();

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // --- SEND OTP ENDPOINT ---
        [HttpPost("send-otp")]
        public IActionResult SendOtp([FromBody] SendOtpRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || !request.Email.Contains("@"))
            {
                return BadRequest(new { message = "Invalid email address." });
            }

            // Generate random 6-digit OTP
            string otpCode = new Random().Next(100000, 999999).ToString();
            OtpStorage[request.Email.ToLower()] = otpCode;

            // Send email using Gmail SMTP and App Password (Removed try/catch fallback so it fails loudly if credentials or connection are wrong)
            string senderEmail = "tamimsatti455@gmail.com";
            string appPassword = "lvxyzaoqrgmkrwsk";

            var smtpClient = new SmtpClient("smtp.gmail.com")
            {
                Port = 587,
                Credentials = new NetworkCredential(senderEmail, appPassword),
                EnableSsl = true,
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(senderEmail, "Masafi Fleet Sync"),
                Subject = "Your Registration Verification OTP Code",
                Body = $"Hello,\n\nYour verification code for Masafi Fleet Sync is: {otpCode}\n\nIt is valid for 10 minutes.",
                IsBodyHtml = false,
            };

            mailMessage.To.Add(request.Email.ToLower());
            smtpClient.Send(mailMessage);

            return Ok(new { message = $"Verification code successfully sent to {request.Email}" });
        }

        // --- REGISTRATION ---
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Verify OTP from temporary store (or accept universal dev code "123456")
            string emailKey = request.Email.ToLower();
            bool isValidOtp = request.VerificationCode == "123456" ||
                              (OtpStorage.TryGetValue(emailKey, out var storedOtp) && storedOtp == request.VerificationCode);

            if (!isValidOtp)
            {
                return BadRequest(new { message = "Invalid or expired verification code." });
            }

            if (await _context.Users.AnyAsync(u => u.Email == emailKey))
                return BadRequest(new { message = "Email already registered." });

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var newUser = new User
            {
                FullName = request.FullName,
                Email = emailKey,
                PhoneNumber = request.PhoneNumber,
                PasswordHash = passwordHash,
                Role = "Customer",
                AccountStatus = "Active"
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            // Clear OTP once used successfully
            OtpStorage.TryRemove(emailKey, out _);

            return Ok(new { message = "Registration successful! You can now log in." });
        }

        // --- LOGIN ---
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.Email == request.Email.ToLower() || u.PhoneNumber == request.Email);

            if (user == null)
            {
                return Unauthorized(new { message = "Debug: User not found in Users table." });
            }

            bool isPasswordValid = false;
            try
            {
                string storedHash = user.PasswordHash?.Trim() ?? string.Empty;
                string inputPassword = request.Password ?? string.Empty;

                if (storedHash.StartsWith("$2"))
                {
                    isPasswordValid = BCrypt.Net.BCrypt.Verify(inputPassword, storedHash);
                }
                else
                {
                    isPasswordValid = (storedHash == inputPassword);
                }
            }
            catch
            {
                isPasswordValid = (user.PasswordHash?.Trim() == request.Password);
            }

            if (!isPasswordValid)
            {
                return Unauthorized(new { message = "Debug: Password hash verification failed." });
            }

            // 1. Block new registrations waiting for initial approval
            if (user.AccountStatus == "Pending Approval")
            {
                return Unauthorized(new { message = "Your account is currently pending admin approval. Please wait for verification." });
            }

            // Fetch matching driver record to map the correct driverId and profile image
            var driverRecord = await _context.Drivers.FirstOrDefaultAsync(d => d.Email.ToLower() == user.Email.ToLower());

            // 2. Allow Drivers with Compliance/License Suspensions to login so they can access the upload portal
            if (user.AccountStatus == "Suspended" && string.Equals(user.Role, "Driver", StringComparison.OrdinalIgnoreCase))
            {
                var restrictedToken = GenerateJwtToken(user);
                return Ok(new
                {
                    token = restrictedToken,
                    role = user.Role,
                    accountStatus = user.AccountStatus,
                    requiresComplianceUpload = true,
                    user = new
                    {
                        id = user.Id,
                        driverId = driverRecord?.Id,
                        fullName = driverRecord?.Name ?? user.FullName,
                        email = user.Email,
                        profileImage = driverRecord?.ProfileImage ?? "default_profile.png"
                    },
                    message = "Login successful. Please upload renewed compliance documents."
                });
            }

            // 3. Block regular or manually banned accounts
            if (user.AccountStatus != "Active")
            {
                return Unauthorized(new { message = "Account is inactive or suspended. Please contact support." });
            }

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                token = token,
                role = user.Role,
                user = new
                {
                    id = user.Id,
                    driverId = driverRecord?.Id,
                    fullName = driverRecord?.Name ?? user.FullName,
                    email = user.Email,
                    profileImage = driverRecord?.ProfileImage ?? "default_profile.png"
                },
                message = "Login successful."
            });
        }

        // --- PASSWORD CHANGE ENDPOINT ---
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            bool isValid = false;
            try
            {
                string storedHash = user.PasswordHash?.Trim() ?? string.Empty;
                string currentPassword = request.CurrentPassword ?? string.Empty;

                if (storedHash.StartsWith("$2"))
                {
                    isValid = BCrypt.Net.BCrypt.Verify(currentPassword, storedHash);
                }
                else
                {
                    isValid = (storedHash == currentPassword);
                }
            }
            catch
            {
                isValid = (user.PasswordHash?.Trim() == request.CurrentPassword);
            }

            if (!isValid)
            {
                return BadRequest(new { message = "Current password is incorrect." });
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password updated successfully." });
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