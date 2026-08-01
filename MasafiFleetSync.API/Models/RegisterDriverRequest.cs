using System.ComponentModel.DataAnnotations;

namespace MasafiFleetSync.API.Models
{
    public class RegisterDriverRequest
    {
        // Core Personal Identity
        [Required] public string Name { get; set; } = string.Empty;
        [Required] public string Email { get; set; } = string.Empty;
        [Required] public string Phone { get; set; } = string.Empty;
        public string EmergencyPhone { get; set; } = string.Empty;
        [Required] public string Password { get; set; } = string.Empty;
        [Required] public string Otp { get; set; } = string.Empty;

        // Legal Driving Credentials
        [Required] public string LicenseNumber { get; set; } = string.Empty;
        [Required] public DateTime LicenseExpiryDate { get; set; }
        [Required] public string LicenseIssuingAuthority { get; set; } = string.Empty;

        // Vehicle Specifications
        [Required] public string VehicleAssignment { get; set; } = string.Empty;
        [Required] public string PlateNumber { get; set; } = string.Empty;
        [Required] public string ChassisNumber { get; set; } = string.Empty;
    }
}