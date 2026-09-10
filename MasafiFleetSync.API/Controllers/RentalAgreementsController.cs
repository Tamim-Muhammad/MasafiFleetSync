using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MasafiFleetSync.API.Data;
using MasafiFleetSync.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace MasafiFleetSync.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RentalAgreementsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RentalAgreementsController(AppDbContext context)
        {
            _context = context;
        }

        // --- BULLETPROOF ID EXTRACTOR ---
        // This entirely bypasses ASP.NET Core's claim mangling and guarantees we get your User ID
        private int? GetAuthorizedUserId()
        {
            var claim = User.Claims.FirstOrDefault(c =>
                c.Type == ClaimTypes.NameIdentifier ||
                c.Type == "nameid" ||
                c.Type == "sub" ||
                c.Type == "id" ||
                c.Type.Contains("nameidentifier"));

            if (claim != null && int.TryParse(claim.Value, out int userId))
            {
                return userId;
            }
            return null;
        }

        // 1. GET: api/RentalAgreements
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RentalAgreement>>> GetRentalAgreements()
        {
            return await _context.RentalAgreements.ToListAsync();
        }

        // 1.1 GET: api/RentalAgreements/my-leases
        [HttpGet("my-leases")]
        [Authorize]
        public async Task<IActionResult> GetMyLeases()
        {
            var userId = GetAuthorizedUserId();
            if (userId == null)
            {
                return Unauthorized(new { message = "Invalid token or user ID not found." });
            }

            var leases = await _context.RentalAgreements
                .Where(r => r.CustomerId == userId.Value)
                .ToListAsync();

            return Ok(leases);
        }

        // 2. GET: api/RentalAgreements/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<RentalAgreement>> GetRentalAgreement(int id)
        {
            var agreement = await _context.RentalAgreements.FindAsync(id);
            if (agreement == null)
            {
                return NotFound(new { message = $"Rental Agreement with ID {id} not found." });
            }
            return agreement;
        }

        // 3. POST: api/RentalAgreements
        [HttpPost]
        [Authorize] // <--- CRITICAL FIX: Secures the endpoint
        public async Task<ActionResult<RentalAgreement>> PostRentalAgreement([FromBody] CustomerLeaseRequest request)
        {
            if (request == null) return BadRequest(new { message = "Payload cannot be null." });

            var userId = GetAuthorizedUserId();
            if (userId == null)
            {
                return Unauthorized(new { message = "Unauthorized. Please log in." });
            }

            var agreement = new RentalAgreement
            {
                ContractReferenceNo = $"MFS-RA-2026-{new Random().Next(1000, 9999)}",
                CustomerId = userId.Value, // <--- CRITICAL FIX: Overwrite frontend ID with the securely verified JWT ID
                VehicleId = request.VehicleId > 0 ? request.VehicleId : 1,
                VehicleCategory = !string.IsNullOrEmpty(request.VehicleCategory) ? request.VehicleCategory : "Industrial Heavy Vehicle",
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                DailyRate = request.DailyRate > 0 ? request.DailyRate : 350.00m,
                TotalPrice = request.TotalPrice,
                SecurityDeposit = request.SecurityDeposit > 0 ? request.SecurityDeposit : 1000.00m,
                DepositStatus = !string.IsNullOrEmpty(request.DepositMethod) ? request.DepositMethod : "Bank Wire Transfer (IBAN)",
                Status = "pending",
                CompanyName = !string.IsNullOrEmpty(request.CompanyName) ? request.CompanyName : "Al-Waqar Enterprise LLC",
                TradeLicenseNo = !string.IsNullOrEmpty(request.TradeLicenseNo) ? request.TradeLicenseNo : "TRD-DEFAULT-01",
                ContactPhone = !string.IsNullOrEmpty(request.ContactPhone) ? request.ContactPhone : "+971 50 000 0000",
                SignatoryName = !string.IsNullOrEmpty(request.SignatoryName) ? request.SignatoryName : "Authorized Signatory",
                ProjectSite = !string.IsNullOrEmpty(request.ProjectSite) ? request.ProjectSite : "Fujairah Regional Site",
                IsDriverCertified = request.IsDriverCertified
            };

            _context.RentalAgreements.Add(agreement);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Lease request logged successfully.", rental = agreement });
        }

        // 4. PUT: api/RentalAgreements/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> PutRentalAgreement(int id, [FromBody] RentalAgreementUpdateDto updateDto)
        {
            var agreement = await _context.RentalAgreements.FindAsync(id);
            if (agreement == null)
            {
                return NotFound(new { message = $"Rental Agreement with ID {id} not found." });
            }

            if (!string.IsNullOrEmpty(updateDto.Status))
            {
                agreement.Status = updateDto.Status.ToLower();
            }

            if (agreement.Status == "active")
            {
                if (!agreement.DepositStatus.Contains("Verified"))
                {
                    agreement.DepositStatus = $"{agreement.DepositStatus} (Verified & Held)";
                }

                var vehicle = await _context.Vehicles.FindAsync(agreement.VehicleId);
                if (vehicle != null)
                {
                    vehicle.Status = "Rented";
                    _context.Entry(vehicle).State = EntityState.Modified;
                }

                var notification = new Notification
                {
                    UserId = agreement.CustomerId,
                    Title = "Lease Agreement Approved! 🚀",
                    Message = $"Your lease request ({agreement.ContractReferenceNo}) for {agreement.CompanyName} has been approved and authorized for depot handover at Al-Waqar Central Fleet Yard, Masafi Depot #4.",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Notifications.Add(notification);
            }

            _context.Entry(agreement).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Rental agreement status updated successfully and customer notified.", rental = agreement });
        }

        // 5. PUT: api/RentalAgreements/5/return
        [HttpPut("{id:int}/return")]
        public async Task<IActionResult> ReturnRentalAsset(int id)
        {
            var agreement = await _context.RentalAgreements.FindAsync(id);
            if (agreement == null)
            {
                return NotFound(new { message = $"Rental Agreement with ID {id} not found." });
            }

            agreement.Status = "completed";
            _context.Entry(agreement).State = EntityState.Modified;

            var vehicleAsset = await _context.Vehicles.FindAsync(agreement.VehicleId);
            if (vehicleAsset != null)
            {
                vehicleAsset.Status = "Available";
                _context.Entry(vehicleAsset).State = EntityState.Modified;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Asset successfully returned and restored to inventory pool." });
        }

        // 6. DELETE: api/RentalAgreements/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteRentalAgreement(int id)
        {
            var agreement = await _context.RentalAgreements.FindAsync(id);
            if (agreement == null) return NotFound();

            _context.RentalAgreements.Remove(agreement);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Deleted successfully." });
        }
    }

    public class CustomerLeaseRequest
    {
        public int CustomerId { get; set; }
        public int VehicleId { get; set; }
        public string VehicleCategory { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal DailyRate { get; set; }
        public decimal SecurityDeposit { get; set; }
        public decimal TotalPrice { get; set; }
        public string DepositMethod { get; set; } = string.Empty;

        // B2B properties including Signatory and Project Site
        public string CompanyName { get; set; } = string.Empty;
        public string TradeLicenseNo { get; set; } = string.Empty;
        public string ContactPhone { get; set; } = string.Empty;
        public string SignatoryName { get; set; } = string.Empty;
        public string ProjectSite { get; set; } = string.Empty;
        public bool IsDriverCertified { get; set; }
    }

    public class RentalAgreementUpdateDto
    {
        public string Status { get; set; } = string.Empty;
    }
}