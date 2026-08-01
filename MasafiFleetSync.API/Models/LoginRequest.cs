using System.ComponentModel.DataAnnotations;

namespace MasafiFleetSync.API.Models
{
    public class LoginRequest
    {
        [Required(ErrorMessage = "Email or Phone is required.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required.")]
        public string Password { get; set; } = string.Empty;
    }
}