using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MasafiFleetSync.API.Data;
using MasafiFleetSync.API.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace MasafiFleetSync.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmergencyIncidentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EmergencyIncidentsController(AppDbContext context)
        {
            _context = context;
        }

        // --- 1. GET: Admin Endpoint to fetch all live SOS Incidents ---
        [HttpGet]
        public async Task<IActionResult> GetAllIncidents()
        {
            var incidents = await _context.EmergencyIncidents
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();

            return Ok(incidents);
        }

        // --- 2. POST: Endpoint that receives the SOS from the Customer ---
        [HttpPost]
        public async Task<IActionResult> ReportIncident([FromBody] EmergencyIncident incident)
        {
            incident.CreatedAt = DateTime.UtcNow;
            incident.Status = "Awaiting Control Room Acknowledgement";

            _context.EmergencyIncidents.Add(incident);

            // Notify all Admins that an SOS was triggered
            var admins = await _context.Users.Where(u => u.Role == "Admin" || u.Role == "SuperAdmin").ToListAsync();
            foreach (var admin in admins)
            {
                _context.Notifications.Add(new Notification
                {
                    UserId = admin.Id,
                    Title = "🚨 SOS ALERT TRIGGERED",
                    Message = $"Incident {incident.IncidentNumber} reported at {incident.Location}. Type: {incident.EmergencyType}.",
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Emergency request successfully transmitted.", incidentId = incident.IncidentNumber });
        }

        // --- 3. PUT: Admin Endpoint to update incident status ---
        [HttpPut("{incidentNumber}/status")]
        public async Task<IActionResult> UpdateIncidentStatus(string incidentNumber, [FromBody] string newStatus)
        {
            var incident = await _context.EmergencyIncidents.FirstOrDefaultAsync(i => i.IncidentNumber == incidentNumber);
            if (incident == null) return NotFound(new { message = $"Incident {incidentNumber} not found." });

            incident.Status = newStatus;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Incident {incidentNumber} status updated to {newStatus}." });
        }
    }
}