using System;
using System.ComponentModel.DataAnnotations;

namespace MasafiFleetSync.API.Models
{
    public class DeliveryRecord
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int DriverId { get; set; }

        [Required]
        [StringLength(50)]
        public required string JobReference { get; set; }

        [Required]
        [StringLength(150)]
        public required string ClientName { get; set; }

        [Required]
        [StringLength(200)]
        public required string ServiceDescription { get; set; }

        [Required]
        [StringLength(150)]
        public required string Location { get; set; }

        [Required]
        public decimal Amount { get; set; }

        public DateTime CompletedAt { get; set; } = DateTime.UtcNow;

        [StringLength(50)]
        public string Status { get; set; } = "Completed & Settled";
    }
}