using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MasafiFleetSync.API.Models
{
    public class WaterOrder
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CustomerId { get; set; } // Foreign Key link to the Customer account User ID

        public int? AssignedVehicleId { get; set; } // Nullable until dispatcher assigns an available asset on Screen 20

        public int? AssignedDriverId { get; set; }  // Nullable until dispatcher pairs a compliant driver

        // Explicit decimal precision parameters to protect Google Maps pin coordinate accuracy (6 decimal places)
        [Required]
        [Column(TypeName = "decimal(9, 6)")]
        public decimal TargetLatitude { get; set; }

        [Required]
        [Column(TypeName = "decimal(9, 6)")]
        public decimal TargetLongitude { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal CalculatedDistanceKm { get; set; } // Calculated natively via Google Distance Matrix API for pricing calculation

        // Core business pricing matrix breakdown matching your formula [Base + (Distance * Per-Km) * Volume]
        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal GrossAmountAED { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal CommissionDeductionAED { get; set; } // Globally configured corporate commission deduction percentage

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal DriverNetEarningsAED { get; set; } // Owed payouts to track on Driver Earnings Ledger (Screen 9)

        // Handles your rigid 3-state physical hand-to-hand cash custody lifecycle flow (Screen 24)
        [Required]
        [StringLength(30)]
        public string CustodyStatus { get; set; } = "PendingCollection"; // PendingCollection, CollectedByDriver, SettledAndReconciled

        [Required]
        [StringLength(30)]
        public string OrderStatus { get; set; } = "Pending"; // Pending, Accepted, EnRoute, Arrived, Completed, Cancelled

        [Required]
        public DateTime OrderTimestamp { get; set; } = DateTime.UtcNow;

        public DateTime? HandoverTimestamp { get; set; } // Logged timestamp once cash is hand-to-hand balanced in the yard
    }
}