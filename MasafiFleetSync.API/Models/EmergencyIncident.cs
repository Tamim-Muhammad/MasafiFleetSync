using System;
using System.ComponentModel.DataAnnotations;

namespace MasafiFleetSync.API.Models
{
    public class EmergencyIncident
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string IncidentNumber { get; set; } = string.Empty;

        public string? RelatedOrder { get; set; }
        public string? RelatedVehicle { get; set; }

        [Required]
        public string ReportedByUserId { get; set; } = string.Empty;

        [Required]
        public string EmergencyType { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public string Location { get; set; } = string.Empty;

        [Required]
        public string Status { get; set; } = "Awaiting Control Room Acknowledgement";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}