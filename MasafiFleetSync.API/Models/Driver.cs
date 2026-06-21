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

        // --- Step 2: Legal Driving Credentials (Screen 4 Onboarding Checklist) ---
        [Required]
        [StringLength(50)]
        public string LicenseNumber { get; set; } = string.Empty;

        [Required]
        public DateTime LicenseExpiryDate { get; set; }

        [Required]
        [StringLength(100)]
        public string LicenseIssuingAuthority { get; set; } = "Fujairah_RTA"; // e.g., Fujairah RTA, Sharjah RTA, Dubai RTA

        [Required]
        [StringLength(50)]
        public string EmiratesIdNumber { get; set; } = string.Empty; // Required for strict UAE field operations

        [Required]
        public DateTime EmiratesIdExpiryDate { get; set; }

        // --- Step 4: Compliance Certificate File Paths (Cloud Storage Containers) ---
        [Required]
        [StringLength(255)]
        public string DrivingLicenseDocumentUrl { get; set; } = string.Empty; // Holds uploaded legal document image for OCR parsing (US#6)

        [Required]
        [StringLength(255)]
        public string DocumentCopyUrl { get; set; } = string.Empty; // Holds uploaded Emirates ID scanned copy path

        // --- Operational & Compliance States ---
        [Required]
        [StringLength(30)]
        public string Status { get; set; } = "Pending Approval"; // Pending Approval (Locks on splash screen), Active, Suspended (US#7)

        [Required]
        [StringLength(30)]
        public string ComplianceStatus { get; set; } = "Non-Compliant"; // Compliant, Warning, Non-Compliant (Screen 6 Clearance)
    }
}