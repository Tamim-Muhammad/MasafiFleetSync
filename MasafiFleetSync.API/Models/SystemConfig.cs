using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MasafiFleetSync.API.Models
{
    public class SystemConfig
    {
        [Key]
        public int Id { get; set; }

        // --- Pricing Variable Controls (SRS FR.30) ---
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal BaseRate { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal PerKmRate { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal VolumeMultiplier { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal CompanyCommissionPercentage { get; set; } // e.g., 15.00 for 15% deduction

        // --- Geofencing Boundary Configurations (SRS FR.29) ---
        [Required]
        public double CenterLatitude { get; set; } = 25.3007; // Default Masafi Coordinates

        [Required]
        public double CenterLongitude { get; set; } = 56.1679;

        [Required]
        public double AllowedRadiusKm { get; set; } = 50.0; // Restricts operational service areas
    }
}