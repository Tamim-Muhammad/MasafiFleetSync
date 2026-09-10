using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MasafiFleetSync.API.Models
{
    public class RentalAgreement
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string ContractReferenceNo { get; set; } = string.Empty;

        [Required]
        public int CustomerId { get; set; }

        [Required]
        public int VehicleId { get; set; }

        [Required]
        [StringLength(100)]
        public string VehicleCategory { get; set; } = string.Empty; // Captures exact asset name selected by customer

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal DailyRate { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal SecurityDeposit { get; set; }

        [Required]
        [StringLength(100)]
        public string DepositStatus { get; set; } = "Paid";

        [Required]
        [StringLength(30)]
        public string Status { get; set; } = "Pending";

        [StringLength(255)]
        public string ContractPdfPath { get; set; } = string.Empty;

        // --- B2B Commercial Lessee Fields ---
        [Required]
        [StringLength(150)]
        public string CompanyName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string TradeLicenseNo { get; set; } = string.Empty;

        [Required]
        [StringLength(30)]
        public string ContactPhone { get; set; } = string.Empty;

        [StringLength(100)]
        public string SignatoryName { get; set; } = string.Empty;

        [StringLength(150)]
        public string ProjectSite { get; set; } = string.Empty;

        [Required]
        public bool IsDriverCertified { get; set; }
    }
}