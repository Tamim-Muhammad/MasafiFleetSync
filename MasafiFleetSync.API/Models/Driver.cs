using System;
using System.ComponentModel.DataAnnotations;

namespace MasafiFleetSync.API.Models
{
    public class Driver
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string Phone { get; set; } = string.Empty;

        [StringLength(20)]
        public string EmergencyPhone { get; set; } = string.Empty;

        [Required]
        public string Otp { get; set; } = string.Empty;

        // --- Step 2: Legal Driving Credentials ---
        [Required]
        [StringLength(50)]
        public string LicenseNumber { get; set; } = string.Empty;

        [Required]
        public DateTime LicenseExpiryDate { get; set; }

        [Required]
        [StringLength(100)]
        public string LicenseIssuingAuthority { get; set; } = "Fujairah_RTA";

        // --- Step 3: Vehicle Specifications ---
        [Required]
        [StringLength(100)]
        public string VehicleAssignment { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string PlateNumber { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string ChassisNumber { get; set; } = string.Empty;

        // --- Step 4: Compliance Certificate File Paths ---
        [Required]
        [StringLength(255)]
        public string DrivingLicenseDocumentUrl { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string DocumentCopyUrl { get; set; } = string.Empty;

        // --- Operational & Compliance States ---
        [Required]
        [StringLength(30)]
        public string Status { get; set; } = "Pending Approval";

        [Required]
        [StringLength(30)]
        public string ComplianceStatus { get; set; } = "Non-Compliant";
    }
}