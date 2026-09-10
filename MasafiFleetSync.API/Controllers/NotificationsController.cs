using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MasafiFleetSync.API.Data;
using MasafiFleetSync.API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MasafiFleetSync.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NotificationsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Notifications/5
        [HttpGet("{userId}")]
        public async Task<ActionResult<IEnumerable<Notification>>> GetCustomerNotifications(int userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        // PUT: api/Notifications/5/read
        [HttpPut("{userId}/read")]
        public async Task<IActionResult> MarkNotificationsAsRead(int userId)
        {
            var unreadNotifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            if (!unreadNotifications.Any())
            {
                return Ok(new { message = "No unread notifications found." });
            }

            foreach (var notification in unreadNotifications)
            {
                notification.IsRead = true;
                _context.Entry(notification).State = EntityState.Modified;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Notifications marked as read. Red badge cleared." });
        }

        // POST: api/Notifications/trigger-compliance-check
        [HttpPost("trigger-compliance-check")]
        public async Task<IActionResult> TriggerComplianceNotifications()
        {
            var config = await _context.SystemConfigs.FirstOrDefaultAsync();
            if (config == null)
            {
                return BadRequest(new { message = "System configuration uninitialized." });
            }

            int warningDaysLimit = 30;
            if (!string.IsNullOrEmpty(config.ComplianceAlertThreshold))
            {
                var parts = config.ComplianceAlertThreshold.Split('/');
                if (parts.Length > 0 && int.TryParse(parts[0].Trim(), out int parsedDays))
                {
                    warningDaysLimit = parsedDays;
                }
            }

            var drivers = await _context.Drivers.ToListAsync();
            var users = await _context.Users.ToListAsync(); // Pull users for identity matching
            int notificationsSent = 0;

            foreach (var driver in drivers)
            {
                // --- IDENTITY BRIDGE ---
                string safeEmail = driver.Email?.Trim().ToLower() ?? "";
                var authUser = users.FirstOrDefault(u => u.Email?.Trim().ToLower() == safeEmail);
                int targetUserId = authUser != null ? authUser.Id : driver.Id;
                // -----------------------

                bool recentAlertExists = await _context.Notifications.AnyAsync(n =>
                    n.UserId == targetUserId && // Fixed: Now uses the Auth ID!
                    n.CreatedAt >= DateTime.UtcNow.AddDays(-1) &&
                    n.Title.Contains("Compliance Expiry Warning"));

                if (!recentAlertExists)
                {
                    var notification = new Notification
                    {
                        UserId = targetUserId, // Fixed: Now uses the Auth ID!
                        Title = "⚠️ Compliance Expiry Warning",
                        Message = $"Attention {driver.Name}: One or more of your operational documents is approaching expiration based on active threshold settings ({warningDaysLimit} Days). Please update your vault.",
                        CreatedAt = DateTime.UtcNow,
                        IsRead = false
                    };

                    _context.Notifications.Add(notification);
                    notificationsSent++;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Compliance scan completed successfully. Dispatched {notificationsSent} relevant notifications based on current settings." });
        }
    }
}