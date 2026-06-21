using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MasafiFleetSync.API.Models
{
    public class Breakdown
    {
        [Key]
        public int Id { get; set; }

        // Nullable relationships seamlessly enable non-affiliated public guest callers to bypass system validation constraints
        public int? VehicleId { get; set; }
        public int? DriverId { get; set; }

        // Manual Intake fields capturing public caller coordinates verbally from the home page banner strip
        [StringLength(100)]
        public string CallerName { get; set; } = string.Empty;

        [StringLength(30)]
        public string CallerPhone { get; set; } = string.Empty;

        // High-precision coordinates ensuring clean interactive marker loads for Screen 23
        [Required]
        [Column(TypeName = "decimal(9, 6)")]
        public decimal IncidentLatitude { get; set; }

        [Required]
        [Column(TypeName = "decimal(9, 6)")]
        public decimal IncidentLongitude { get; set; }

        [Required]
        [StringLength(500)]
        public string IssueDescription { get; set; } = string.Empty; // e.g., "Rear left tire blowout", "Engine overheating"

        [Required]
        [StringLength(30)]
        public string Severity { get; set; } = "Minor"; // Minor, Major, Critical (Hard block assignments if Critical)

        [Required]
        [StringLength(30)]
        public string Status { get; set; } = "Reported"; // Reported, Dispatched, In Progress, Resolved, Cancelled

        [StringLength(150)]
        public string AssignedRecoveryUnit { get; set; } = string.Empty; // Tracks dispatched recovery team or third-party tow trucks

        [Column(TypeName = "decimal(18,2)")]
        public decimal? RecoveryCost { get; set; } // Logs maintenance transaction history for budgeting records

        [StringLength(500)]
        public string ResolutionNotes { get; set; } = string.Empty; // Post-repair outcomes for evaluation reporting

        [Required]
        public DateTime ReportedAt { get; set; } = DateTime.UtcNow;

        public DateTime? DispatchedAt { get; set; } // Tracks dispatcher efficiency response metrics

        public DateTime? ResolvedAt { get; set; } // Populated when mechanic completes the repair ticket
    }
}