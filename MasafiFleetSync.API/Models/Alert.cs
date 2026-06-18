using System;
using System.ComponentModel.DataAnnotations;

namespace MasafiFleetSync.API.Models
{
    public class Alert
    {
        [Key]
        public int Id { get; set; }

        // Nullable links: An alert can target either a driver or a vehicle asset depending on the compliance issue
        public int? VehicleId { get; set; }

        public int? DriverId { get; set; }

        [Required]
        [StringLength(50)]
        public string AlertType { get; set; } = string.Empty; // e.g., "License_Expiry", "Mulkiya_Expiry", "Insurance_Expiry", "Breakdown_Incident"

        [Required]
        [StringLength(500)] // Extended to allow detailed system milestone notification strings
        public string Details { get; set; } = string.Empty; // e.g., "Driver's License expires in 14 days. Action required."

        [Required]
        [StringLength(30)]
        public string Severity { get; set; } = "Warning"; // Info, Warning (30/15 Days), Critical (7 Days / Expired)

        [Required]
        public int MilestoneDaysRemaining { get; set; } // Explicit tracking property for the mandatory 30, 15, and 7-day logic

        [Required]
        public bool IsResolved { get; set; } = false;

        [Required]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public DateTime? ResolvedAt { get; set; }
    }
}