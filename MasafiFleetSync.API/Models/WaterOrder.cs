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
        public int CustomerId { get; set; }

        [Required]
        public int VolumeGallons { get; set; } = 5000;

        public int? AssignedVehicleId { get; set; }
        public int? AssignedDriverId { get; set; }

        [Required]
        [StringLength(255)]
        public string DeliveryAddress { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string CustomerPhone { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(9, 6)")]
        public decimal TargetLatitude { get; set; }

        [Required]
        [Column(TypeName = "decimal(9, 6)")]
        public decimal TargetLongitude { get; set; }

        [Column(TypeName = "decimal(9, 6)")]
        public decimal? CurrentLatitude { get; set; }

        [Column(TypeName = "decimal(9, 6)")]
        public decimal? CurrentLongitude { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal CalculatedDistanceKm { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal GrossAmountAED { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal CommissionDeductionAED { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal DriverNetEarningsAED { get; set; }

        [Required]
        [StringLength(30)]
        public string CustodyStatus { get; set; } = "PendingCollection";

        [Required]
        [StringLength(30)]
        public string OrderStatus { get; set; } = "Pending";

        [Required]
        public DateTime OrderTimestamp { get; set; } = DateTime.UtcNow;

        public DateTime? HandoverTimestamp { get; set; }
    }
}