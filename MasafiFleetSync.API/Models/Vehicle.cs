using System;
using System.ComponentModel.DataAnnotations;

namespace MasafiFleetSync.API.Models
{
    public class Vehicle
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(30)]
        public string VehicleNumber { get; set; } = string.Empty; // e.g., UAE-12345

        [Required]
        [StringLength(50)]
        public string Model { get; set; } = string.Empty; // e.g., Mercedes-Benz Actros

        [Required]
        [StringLength(30)]
        public string Type { get; set; } = string.Empty; // Tanker, Loading Asset

        [Required]
        public int Capacity { get; set; } // Stored in Gallons for water distribution matching SRS specs

        [Required]
        [StringLength(30)]
        public string Status { get; set; } = "Active"; // Active, In Maintenance, Rented, Out of Service

        [Required]
        [StringLength(100)]
        public string InsurancePolicyNumber { get; set; } = string.Empty;

        [Required]
        public DateTime InsuranceExpiryDate { get; set; }

        [Required]
        [StringLength(100)]
        public string MulkiyaNumber { get; set; } = string.Empty; // Essential UAE Registration Card Identifier

        [Required]
        public DateTime RegistrationExpiryDate { get; set; } // Map to Mulkiya Expiry for the 30/15/7 day milestone notifications

        // Stores the file path of the scanned vehicle registration document for OCR verification (US#6)
        [StringLength(255)]
        public string MulkiyaDocumentUrl { get; set; } = string.Empty;

        [Required]
        [StringLength(30)]
        public string FleetCategory { get; set; } = "Internal"; // Internal (Owned Fleet), Rental Catalog Asset

        [Required]
        public bool IsCompliant { get; set; } = true; // Hard lock flag for simultaneous assignment validation
    }
}