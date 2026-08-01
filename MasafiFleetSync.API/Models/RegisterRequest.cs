using System.ComponentModel.DataAnnotations;

namespace MasafiFleetSync.API.Models
{
    public class RegisterRequest
    {
        [Required(ErrorMessage = "Full Name is required.")]
        public string FullName { get; set; } = string.Empty;

        [Required, EmailAddress(ErrorMessage = "Invalid email format.")]
        public string Email { get; set; } = string.Empty;

        [Required, RegularExpression(@"^\+?[0-9]{7,15}$", ErrorMessage = "Phone must be 7-15 digits, optionally starting with '+'.")]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required, MinLength(8, ErrorMessage = "Password must be at least 8 characters.")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Verification code is required.")]
        public string VerificationCode { get; set; } = string.Empty;
    }
}