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
        public string ContractReferenceNo { get; set; } = string.Empty; // e.g., "MFS-RA-2026-0001" supporting US#11 system generations

        [Required]
        public int CustomerId { get; set; } // Link to the Customer/Renter account User ID

        [Required]
        public int VehicleId { get; set; } // Link to the rented Tanker/Vehicle asset ID

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; } // Updated to decimal to maintain enterprise financial transaction precision

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal SecurityDeposit { get; set; } // Updated to decimal to maintain enterprise financial transaction precision

        [Required]
        [StringLength(50)]
        public string DepositStatus { get; set; } = "Paid"; // Paid, Refunded, RetainedForDamages (BRD Section 4.5)

        [Required]
        [StringLength(30)]
        public string Status { get; set; } = "Pending"; // Pending, Approved, Active, Completed, Cancelled

        [StringLength(255)]
        public string ContractPdfPath { get; set; } = string.Empty; // Local file path hosting the generated contract layout
    }
}