using System;
using System.ComponentModel.DataAnnotations;

namespace MasafiFleetSync.API.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)] // Extended from 50 to 100 to prevent truncating long enterprise emails
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [StringLength(30)]
        public string Role { get; set; } = "Customer"; // SuperAdmin, Dispatcher, Customer, Driver (RBAC validation)

        [Required]
        [StringLength(30)]
        public string AccountStatus { get; set; } = "Pending"; // PendingApproval, Active, Suspended (US#7)

        // --- Security Audit Tracking (US#20 Brute-Force Lockout Engine) ---
        [Required]
        public int FailedLoginAttempts { get; set; } = 0; // Increments on bad credentials. Blocks at 5.

        public DateTime? LockoutEnd { get; set; } // Stores the timestamp when the 15-minute lock expires

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}