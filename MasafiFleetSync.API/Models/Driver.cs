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
        [StringLength(50)]
        public string LicenseNumber { get; set; } = string.Empty;

        [Required]
        public DateTime LicenseExpiryDate { get; set; }

        [Required]
        [StringLength(50)]
        public string EmiratesIdNumber { get; set; } = string.Empty; // Required for UAE business operations

        [Required]
        public DateTime EmiratesIdExpiryDate { get; set; }

        // Stores the URL/path of scanned uploads for backend tracking or OCR processing (US#6)
        [StringLength(255)]
        public string DocumentCopyUrl { get; set; } = string.Empty;

        [Required]
        [StringLength(30)]
        public string Status { get; set; } = "Active"; // Active, Suspended, Pending Approval

        [Required]
        [StringLength(30)]
        public string ComplianceStatus { get; set; } = "Compliant"; // Compliant, Warning, Non-Compliant
    }
}