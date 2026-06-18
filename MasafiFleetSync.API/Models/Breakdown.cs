using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MasafiFleetSync.API.Models
{
    public class Breakdown
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int VehicleId { get; set; } // Foreign Key link to the troubled truck or water tanker asset

        [Required]
        public int DriverId { get; set; } // Identifies the driver stranded or reporting the incident (SRS Section 2.6)

        [Required]
        [StringLength(255)]
        public string Location { get; set; } = string.Empty; // Supports detailed address text or raw GPS coordinates string

        [Required]
        [StringLength(500)]
        public string IssueDescription { get; set; } = string.Empty; // e.g., "Water pump leak", "Engine overheating"

        [Required]
        [StringLength(30)]
        public string Severity { get; set; } = "Minor"; // Minor, Major, Critical (Hard block assignments if Critical)

        [Required]
        [StringLength(30)]
        public string Status { get; set; } = "Reported"; // Reported, Dispatched, In Progress, Resolved, Cancelled

        [StringLength(150)]
        public string AssignedRecoveryUnit { get; set; } = string.Empty; // Tracks dispatched internal mechanic team or third-party recovery vehicle (US#14)

        [Column(TypeName = "decimal(18,2)")]
        public decimal? RecoveryCost { get; set; } // Tracks emergency maintenance transaction history for budgeting records (US#12)

        [StringLength(500)]
        public string ResolutionNotes { get; set; } = string.Empty; // Added to log post-mortem repair outcomes for evaluation reporting

        [Required]
        public DateTime ReportedAt { get; set; } = DateTime.UtcNow;

        public DateTime? DispatchedAt { get; set; } // Tracks dispatcher efficiency response metrics

        public DateTime? ResolvedAt { get; set; } // Populated when mechanic completes the repair ticket
    }
}