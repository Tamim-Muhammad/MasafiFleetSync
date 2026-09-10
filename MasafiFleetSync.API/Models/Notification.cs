using System;
using System.ComponentModel.DataAnnotations;

namespace MasafiFleetSync.API.Models
{
    public class Notification
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; } // The Customer ID receiving the alert

        [Required]
        [StringLength(255)]
        public string Title { get; set; }

        [Required]
        [StringLength(500)]
        public string Message { get; set; }

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}