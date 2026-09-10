using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using MasafiFleetSync.API.Data;
using MasafiFleetSync.API.Models;
using BCrypt.Net;

namespace MasafiFleetSync.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DriversController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public DriversController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // POST: api/drivers/register
        [HttpPost("register")]
        public async Task<ActionResult<Driver>> RegisterDriver([FromForm] RegisterDriverRequest request)
        {
            // Verify OTP from temporary store (allowing "123456" as universal test bypass)
            string emailKey = request.Email?.ToLower() ?? string.Empty;
            bool isValidOtp = request.Otp == "123456" ||
                              (AuthController.OtpStorage.TryGetValue(emailKey, out var storedOtp) && storedOtp == request.Otp);

            if (!isValidOtp)
            {
                return BadRequest(new { message = "Invalid or expired verification code." });
            }

            if (request.LicenseExpiryDate.Date < DateTime.Today)
            {
                return BadRequest(new { message = "Registration denied: The provided driving license has expired." });
            }

            if (await _context.Users.AnyAsync(u => u.Email == emailKey))
            {
                return BadRequest(new { message = "Email already registered." });
            }

            if (await _context.Users.AnyAsync(u => u.PhoneNumber == request.Phone))
            {
                return BadRequest(new { message = "Phone number already registered." });
            }

            async Task<string> SaveFileAsync(IFormFile? file, string prefix)
            {
                if (file == null || file.Length == 0) return string.Empty;

                string uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                string uniqueFileName = $"{prefix}_{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
                string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }

                return uniqueFileName;
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                string profileFileName = await SaveFileAsync(request.ProfileImage, "profile");
                string licenseFileName = await SaveFileAsync(request.DrivingLicenseDocument, "license");
                string mulkiyaFileName = await SaveFileAsync(request.MulkiyaDocument, "mulkiya");
                string insuranceFileName = await SaveFileAsync(request.InsuranceDocument, "insurance");
                string photosFileName = await SaveFileAsync(request.PhotosDocument, "photo");

                var driver = new Driver
                {
                    Name = request.Name,
                    Email = emailKey,
                    Phone = request.Phone,
                    EmergencyPhone = request.EmergencyPhone,
                    Otp = request.Otp,

                    LicenseNumber = request.LicenseNumber,
                    LicenseExpiryDate = request.LicenseExpiryDate,
                    LicenseIssuingAuthority = request.LicenseIssuingAuthority,

                    VehicleAssignment = request.VehicleAssignment,
                    PlateNumber = request.PlateNumber,
                    ChassisNumber = request.ChassisNumber,

                    ProfileImage = string.IsNullOrEmpty(profileFileName) ? "default_profile.png" : profileFileName,
                    DrivingLicenseDocumentUrl = string.IsNullOrEmpty(licenseFileName) ? "license_document.png" : licenseFileName,
                    MulkiyaDocumentUrl = string.IsNullOrEmpty(mulkiyaFileName) ? "mulkiya_certificate.png" : mulkiyaFileName,
                    InsuranceDocumentUrl = string.IsNullOrEmpty(insuranceFileName) ? "insurance_policy.png" : insuranceFileName,
                    PhotosDocumentUrl = string.IsNullOrEmpty(photosFileName) ? "fleet_asset_photo.png" : photosFileName,

                    Status = "Pending Approval",
                    ComplianceStatus = "Non-Compliant"
                };

                _context.Drivers.Add(driver);
                await _context.SaveChangesAsync();

                int parsedCapacity = request.VehicleAssignment.Contains("5000") ? 5000 : 1000;
                string assignedPlate = string.IsNullOrEmpty(request.PlateNumber) ? $"V-{parsedCapacity}T-{driver.Id}" : request.PlateNumber;

                var vehicleAsset = new Vehicle
                {
                    VehicleNumber = assignedPlate,
                    Model = request.VehicleAssignment,
                    Capacity = parsedCapacity,
                    Status = "Available",
                    IsCompliant = false,
                    Type = "Water Tanker",
                    MulkiyaNumber = $"REG-{assignedPlate}",
                    InsurancePolicyNumber = $"POL-{driver.Id}-AW",
                    RegistrationExpiryDate = request.RegistrationExpiryDate,
                    InsuranceExpiryDate = request.InsuranceExpiryDate,
                    MulkiyaDocumentUrl = string.IsNullOrEmpty(mulkiyaFileName) ? string.Empty : mulkiyaFileName,
                    InsuranceDocumentUrl = string.IsNullOrEmpty(insuranceFileName) ? string.Empty : insuranceFileName,
                    VehiclePhotoUrl = string.IsNullOrEmpty(photosFileName) ? string.Empty : photosFileName
                };

                _context.Vehicles.Add(vehicleAsset);

                string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
                var userRecord = new User
                {
                    FullName = request.Name,
                    Email = emailKey,
                    PhoneNumber = request.Phone,
                    PasswordHash = passwordHash,
                    Role = "Driver",
                    AccountStatus = "Pending Approval"
                };

                _context.Users.Add(userRecord);
                await _context.SaveChangesAsync();

                // Clear OTP once used successfully
                AuthController.OtpStorage.TryRemove(emailKey, out _);

                await transaction.CommitAsync();

                return CreatedAtAction(nameof(GetDriver), new { id = driver.Id }, driver);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Registration failed due to a database error.", details = ex.InnerException?.Message ?? ex.Message });
            }
        }

        // PUT: api/drivers/5/approve
        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveDriver(int id)
        {
            var driver = await _context.Drivers.FindAsync(id);
            if (driver == null)
                return NotFound(new { message = $"Driver with ID {id} not found." });

            driver.Status = "Approved / Active";
            driver.ComplianceStatus = "Compliant";

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == driver.Email.ToLower());
            if (user != null)
            {
                user.AccountStatus = "Active";
            }

            var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.VehicleNumber == driver.PlateNumber);
            if (vehicle != null)
            {
                vehicle.IsCompliant = true;
                vehicle.Status = "Available";
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Driver {driver.Name}, user account, and vehicle asset approved successfully." });
        }

        // PUT: api/drivers/5/blockade (Ground Vehicle & Flag Compliance without locking login)
        [HttpPut("{id}/blockade")]
        public async Task<IActionResult> ToggleDriverBlockade(int id)
        {
            var driver = await _context.Drivers.FindAsync(id);
            if (driver == null)
                return NotFound(new { message = $"Driver with ID {id} not found." });

            bool isCurrentlySuspended = string.Equals(driver.ComplianceStatus, "Non-Compliant", StringComparison.OrdinalIgnoreCase);

            if (isCurrentlySuspended)
            {
                driver.Status = "Approved / Active";
                driver.ComplianceStatus = "Compliant";
            }
            else
            {
                driver.Status = "Suspended";
                driver.ComplianceStatus = "Non-Compliant";
            }

            var allVehicles = await _context.Vehicles.ToListAsync();
            Vehicle? vehicle = null;

            string cleanPlate = driver.PlateNumber?.Trim().ToLower() ?? "";
            string cleanAssignment = driver.VehicleAssignment?.Trim().ToLower() ?? "";

            if (!string.IsNullOrEmpty(cleanPlate) || !string.IsNullOrEmpty(cleanAssignment))
            {
                vehicle = allVehicles.FirstOrDefault(v => {
                    string vNum = v.VehicleNumber?.Trim().ToLower() ?? "";
                    string vMod = v.Model?.Trim().ToLower() ?? "";

                    return (!string.IsNullOrEmpty(cleanPlate) && (vNum.Contains(cleanPlate) || cleanPlate.Contains(vNum))) ||
                           (!string.IsNullOrEmpty(cleanAssignment) && (vMod.Contains(cleanAssignment) || cleanAssignment.Contains(vMod) || vNum.Contains(cleanAssignment)));
                });
            }

            if (vehicle == null)
            {
                vehicle = allVehicles.FirstOrDefault(v => v.VehicleNumber?.EndsWith("-" + driver.Id) == true);
            }

            if (vehicle != null)
            {
                if (isCurrentlySuspended)
                {
                    vehicle.Status = "Available";
                    vehicle.IsCompliant = true;
                }
                else
                {
                    vehicle.Status = "Blockaded";
                    vehicle.IsCompliant = false;
                }
            }

            await _context.SaveChangesAsync();

            string vMsg = vehicle != null ? $" and vehicle '{vehicle.VehicleNumber}' was successfully grounded" : " (Note: No vehicle match linked to this profile)";

            return Ok(new
            {
                message = $"Driver {driver.Name} compliance updated{vMsg}. Login remains active for document upload.",
                status = driver.ComplianceStatus
            });
        }

        // GET: api/drivers/pending
        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<Driver>>> GetPendingDrivers()
        {
            return await _context.Drivers
                .Where(d => d.Status == "Pending Approval")
                .ToListAsync();
        }

        // GET: api/drivers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Driver>>> GetDrivers()
        {
            return await _context.Drivers.ToListAsync();
        }

        // GET: api/drivers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Driver>> GetDriver(int id)
        {
            // FIXED: Directly fetches from Drivers table using the Driver ID. No cross-table lookup.
            var driver = await _context.Drivers.FindAsync(id);
            if (driver == null)
            {
                return NotFound(new { message = $"Driver with ID {id} not found." });
            }

            return Ok(driver);
        }

        // GET: api/drivers/5/documents
        [HttpGet("{id}/documents")]
        public async Task<IActionResult> GetDriverDocuments(int id)
        {
            // FIXED: Directly fetches from Drivers table using the Driver ID. No cross-table lookup.
            var driver = await _context.Drivers.FindAsync(id);

            if (driver == null)
                return NotFound(new { message = $"Driver record with identifier {id} not found." });

            var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.VehicleNumber == driver.PlateNumber);
            var baseUrl = $"{Request.Scheme}://{Request.Host}/uploads/";

            var documents = new List<object>
            {
                new
                {
                    id = "DOC-CDL",
                    title = "Commercial Driving License (CDL)",
                    number = driver.LicenseNumber ?? "UAE-DXB-PENDING",
                    expiryDate = driver.LicenseExpiryDate.ToString("yyyy-MM-dd"),
                    issuer = string.IsNullOrEmpty(driver.LicenseIssuingAuthority) ? "Fujairah Licensing Authority" : driver.LicenseIssuingAuthority,
                    type = "Official Driving License",
                    status = driver.LicenseExpiryDate.Date >= DateTime.UtcNow.Date ? "Valid" : "Expired",
                    fileUrl = !string.IsNullOrEmpty(driver.DrivingLicenseDocumentUrl) ? baseUrl + driver.DrivingLicenseDocumentUrl : null,
                    category = "license"
                },
                new
                {
                    id = "DOC-MULKIYA",
                    title = "Vehicle Registration (Mulkiya)",
                    number = driver.PlateNumber ?? (vehicle?.VehicleNumber ?? "UNASSIGNED"),
                    expiryDate = vehicle?.RegistrationExpiryDate.ToString("yyyy-MM-dd") ?? driver.LicenseExpiryDate.AddMonths(6).ToString("yyyy-MM-dd"),
                    issuer = "Ministry of Interior - UAE",
                    type = "Official Mulkiya Card",
                    status = (vehicle != null && vehicle.RegistrationExpiryDate.Date < DateTime.UtcNow.Date) ? "Expired" : "Valid",
                    fileUrl = !string.IsNullOrEmpty(driver.MulkiyaDocumentUrl) ? baseUrl + driver.MulkiyaDocumentUrl : null,
                    category = "registration"
                },
                new
                {
                    id = "DOC-INSURANCE",
                    title = "Vehicle Commercial Insurance",
                    number = !string.IsNullOrEmpty(driver.ChassisNumber) ? $"POL-{driver.ChassisNumber}" : "POL-COMMERCIAL-VALID",
                    expiryDate = vehicle?.InsuranceExpiryDate.ToString("yyyy-MM-dd") ?? driver.LicenseExpiryDate.AddMonths(4).ToString("yyyy-MM-dd"),
                    issuer = "Oman Insurance Co. / UAE P&I",
                    type = "Insurance Policy Certificate",
                    status = (vehicle != null && vehicle.InsuranceExpiryDate.Date < DateTime.UtcNow.Date) ? "Expired" : "Valid",
                    fileUrl = !string.IsNullOrEmpty(driver.InsuranceDocumentUrl) ? baseUrl + driver.InsuranceDocumentUrl : null,
                    category = "insurance"
                },
                new
                {
                    id = "DOC-PHOTOS",
                    title = "Vehicle Inspection & Asset Photos",
                    number = driver.VehicleAssignment ?? "Standard Fleet Tanker",
                    expiryDate = (string?)null,
                    issuer = "Al-Waqar Technical Operations",
                    type = "Physical Asset Verification",
                    status = "Verified",
                    fileUrl = !string.IsNullOrEmpty(driver.PhotosDocumentUrl) ? baseUrl + driver.PhotosDocumentUrl : null,
                    category = "asset"
                }
            };

            return Ok(new
            {
                driverId = driver.Id,
                driverName = driver.Name,
                accountStatus = driver.Status,
                complianceStatus = driver.ComplianceStatus,
                documents
            });
        }

        // PUT: api/drivers/5/documents/upload
        [HttpPut("{id}/documents/upload")]
        public async Task<IActionResult> UploadDriverDocument(int id, IFormFile file, [FromForm] string category, [FromForm] DateTime? expiryDate)
        {
            // FIXED: Directly fetches from Drivers table using the Driver ID. No cross-table lookup.
            var driver = await _context.Drivers.FindAsync(id);
            if (driver == null) return NotFound(new { message = "Driver not found." });

            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            string uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            string uniqueFileName = $"{category}_{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
            string filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            string cleanPlate = driver.PlateNumber?.Trim().ToLower() ?? "";
            var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.VehicleNumber.ToLower() == cleanPlate);

            if (vehicle == null && !string.IsNullOrEmpty(driver.PlateNumber))
            {
                vehicle = new Vehicle
                {
                    VehicleNumber = driver.PlateNumber,
                    Model = driver.VehicleAssignment ?? "Water Tanker",
                    Capacity = 5000,
                    Status = "Available",
                    MulkiyaNumber = $"REG-{driver.PlateNumber}",
                    InsurancePolicyNumber = $"POL-{driver.Id}-AW"
                };
                _context.Vehicles.Add(vehicle);
            }
            else if (vehicle != null)
            {
                if (string.IsNullOrEmpty(vehicle.MulkiyaNumber))
                    vehicle.MulkiyaNumber = $"REG-{driver.PlateNumber ?? driver.Id.ToString()}";
                if (string.IsNullOrEmpty(vehicle.InsurancePolicyNumber))
                    vehicle.InsurancePolicyNumber = $"POL-{driver.Id}-AW";
            }

            switch (category?.ToLower())
            {
                case "license":
                    driver.DrivingLicenseDocumentUrl = uniqueFileName;
                    if (expiryDate.HasValue) driver.LicenseExpiryDate = expiryDate.Value;
                    break;
                case "registration":
                case "mulkiya":
                    driver.MulkiyaDocumentUrl = uniqueFileName;
                    if (vehicle != null)
                    {
                        vehicle.MulkiyaDocumentUrl = uniqueFileName;
                        if (string.IsNullOrEmpty(vehicle.MulkiyaNumber))
                        {
                            vehicle.MulkiyaNumber = $"REG-{driver.PlateNumber ?? driver.Id.ToString()}";
                        }
                        if (expiryDate.HasValue)
                        {
                            vehicle.RegistrationExpiryDate = expiryDate.Value;
                        }
                    }
                    break;
                case "insurance":
                    driver.InsuranceDocumentUrl = uniqueFileName;
                    if (vehicle != null)
                    {
                        vehicle.InsuranceDocumentUrl = uniqueFileName;
                        if (string.IsNullOrEmpty(vehicle.InsurancePolicyNumber))
                        {
                            vehicle.InsurancePolicyNumber = $"POL-{driver.Id}-AW";
                        }
                        if (expiryDate.HasValue)
                        {
                            vehicle.InsuranceExpiryDate = expiryDate.Value;
                        }
                    }
                    break;
                case "asset":
                case "photos":
                    driver.PhotosDocumentUrl = uniqueFileName;
                    if (vehicle != null) vehicle.VehiclePhotoUrl = uniqueFileName;
                    break;
                default:
                    return BadRequest(new { message = "Invalid document category." });
            }

            var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == driver.Email.ToLower());
            int targetUserId = dbUser?.Id ?? driver.Id;

            string lowerCategory = category.ToLower();
            var pendingAlerts = await _context.Notifications
                .Where(n => n.UserId == targetUserId && n.IsRead == false)
                .ToListAsync();

            pendingAlerts = pendingAlerts.Where(n => n.Title != null && n.Title.ToLower().Contains(lowerCategory)).ToList();

            foreach (var alert in pendingAlerts)
            {
                alert.IsRead = true;
            }

            bool licenseValid = driver.LicenseExpiryDate.Date >= DateTime.Today;
            bool vehicleRegValid = vehicle == null || vehicle.RegistrationExpiryDate.Date >= DateTime.Today;
            bool vehicleInsValid = vehicle == null || vehicle.InsuranceExpiryDate.Date >= DateTime.Today;

            if (licenseValid && vehicleRegValid && vehicleInsValid)
            {
                driver.ComplianceStatus = "Compliant";
                if (driver.Status == "Suspended")
                {
                    driver.Status = "Approved / Active";
                }
                if (vehicle != null)
                {
                    vehicle.IsCompliant = true;
                    vehicle.Status = "Available";
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Document updated, expiry date extended, admin alerts cleared, and compliance status re-evaluated successfully.", fileName = uniqueFileName });
        }

        // GET: api/drivers/5/download/license
        [HttpGet("{id}/download/{category}")]
        public async Task<IActionResult> DownloadDriverDocument(int id, string category)
        {
            // FIXED: Directly fetches from Drivers table using the Driver ID. No cross-table lookup.
            var driver = await _context.Drivers.FindAsync(id);
            if (driver == null) return NotFound(new { message = "Driver not found." });

            string? fileName = category.ToLower() switch
            {
                "license" => driver.DrivingLicenseDocumentUrl,
                "registration" => driver.MulkiyaDocumentUrl,
                "mulkiya" => driver.MulkiyaDocumentUrl,
                "insurance" => driver.InsuranceDocumentUrl,
                "asset" => driver.PhotosDocumentUrl,
                "photos" => driver.PhotosDocumentUrl,
                _ => null
            };

            if (string.IsNullOrEmpty(fileName)) return NotFound(new { message = "Document not found." });

            string filePath = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", fileName);

            if (!System.IO.File.Exists(filePath)) return NotFound(new { message = "File missing from server." });

            string contentType = fileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? "application/pdf" : "image/jpeg";

            return PhysicalFile(filePath, contentType, fileName);
        }

        // POST: api/drivers
        [HttpPost]
        public async Task<ActionResult<Driver>> CreateDriver(Driver driver)
        {
            _context.Drivers.Add(driver);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetDriver), new { id = driver.Id }, driver);
        }

        // PUT: api/drivers/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDriver(int id, Driver driver)
        {
            if (id != driver.Id) return BadRequest(new { message = "ID mismatch." });
            _context.Entry(driver).State = EntityState.Modified;
            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Drivers.Any(e => e.Id == id)) return NotFound();
                else throw;
            }
            return NoContent();
        }

        // DELETE: api/drivers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDriver(int id)
        {
            var driver = await _context.Drivers.FindAsync(id);
            if (driver == null) return NotFound(new { message = $"Driver with ID {id} not found." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == driver.Email.ToLower());
            if (user != null)
            {
                _context.Users.Remove(user);
            }

            string uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
            string[] docUrls = { driver.DrivingLicenseDocumentUrl, driver.MulkiyaDocumentUrl, driver.InsuranceDocumentUrl, driver.PhotosDocumentUrl, driver.ProfileImage };

            foreach (var fileUrl in docUrls)
            {
                if (!string.IsNullOrEmpty(fileUrl) &&
                    !fileUrl.EndsWith("_document.png") &&
                    !fileUrl.EndsWith("_certificate.png") &&
                    !fileUrl.EndsWith("_policy.png") &&
                    !fileUrl.EndsWith("_photo.png") &&
                    !fileUrl.EndsWith("default_profile.png"))
                {
                    string filePath = Path.Combine(uploadsFolder, fileUrl);
                    if (System.IO.File.Exists(filePath))
                    {
                        try { System.IO.File.Delete(filePath); } catch { }
                    }
                }
            }

            _context.Drivers.Remove(driver);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Driver package DRV-{id} and matching user account successfully purged." });
        }

        // GET: api/drivers/trigger-compliance-check
        [HttpGet("trigger-compliance-check")]
        public async Task<IActionResult> TriggerComplianceCheck()
        {
            var config = await _context.SystemConfigs.FirstOrDefaultAsync();
            int[] alertDays = config?.ComplianceAlertThreshold?.Contains("45") == true
                ? new int[] { 45, 30, 14 }
                : new int[] { 30, 15, 7 };

            var drivers = await _context.Drivers.ToListAsync();
            var vehicles = await _context.Vehicles.ToListAsync();
            var users = await _context.Users.ToListAsync();
            var currentDate = DateTime.UtcNow.Date;
            int count = 0;

            foreach (var driver in drivers)
            {
                var vehicle = vehicles.FirstOrDefault(v => v.VehicleNumber?.Trim().ToLower() == driver.PlateNumber?.Trim().ToLower() || v.VehicleNumber?.EndsWith("-" + driver.Id) == true);
                var user = users.FirstOrDefault(u => u.Email?.Trim().ToLower() == driver.Email?.Trim().ToLower());
                int targetUserId = user?.Id ?? driver.Id;

                int licenseDays = (driver.LicenseExpiryDate.Date - currentDate).Days;
                if (alertDays.Contains(licenseDays) || licenseDays < 0)
                {
                    string msg = licenseDays < 0
                        ? $"Your driver license (No: {driver.LicenseNumber}) expired {-licenseDays} days ago. Please renew immediately."
                        : $"Your official driver license (No: {driver.LicenseNumber}) will expire in {licenseDays} days.";

                    bool exists = await _context.Notifications.AnyAsync(n => n.UserId == targetUserId && n.Message == msg && n.CreatedAt >= currentDate.AddDays(-1));
                    if (!exists)
                    {
                        _context.Notifications.Add(new Notification
                        {
                            UserId = targetUserId,
                            Title = "License Expiry Alert",
                            Message = msg,
                            IsRead = false,
                            CreatedAt = DateTime.UtcNow
                        });
                        count++;
                    }
                }

                if (vehicle != null)
                {
                    int regDays = (vehicle.RegistrationExpiryDate.Date - currentDate).Days;
                    if (alertDays.Contains(regDays) || regDays < 0)
                    {
                        string msg = regDays < 0
                            ? $"Vehicle registration for {vehicle.VehicleNumber} expired {-regDays} days ago."
                            : $"Vehicle registration for {vehicle.VehicleNumber} will expire in {regDays} days.";

                        bool exists = await _context.Notifications.AnyAsync(n => n.UserId == targetUserId && n.Message == msg && n.CreatedAt >= currentDate.AddDays(-1));
                        if (!exists)
                        {
                            _context.Notifications.Add(new Notification
                            {
                                UserId = targetUserId,
                                Title = "Registration Expiry Alert",
                                Message = msg,
                                IsRead = false,
                                CreatedAt = DateTime.UtcNow
                            });
                            count++;
                        }
                    }

                    int insDays = (vehicle.InsuranceExpiryDate.Date - currentDate).Days;
                    if (alertDays.Contains(insDays) || insDays < 0)
                    {
                        string msg = insDays < 0
                            ? $"Insurance policy for {vehicle.VehicleNumber} expired {-insDays} days ago."
                            : $"Insurance policy for {vehicle.VehicleNumber} will expire in {insDays} days.";

                        bool exists = await _context.Notifications.AnyAsync(n => n.UserId == targetUserId && n.Message == msg && n.CreatedAt >= currentDate.AddDays(-1));
                        if (!exists)
                        {
                            _context.Notifications.Add(new Notification
                            {
                                UserId = targetUserId,
                                Title = "Insurance Expiry Alert",
                                Message = msg,
                                IsRead = false,
                                CreatedAt = DateTime.UtcNow
                            });
                            count++;
                        }
                    }
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Multi-vector compliance check executed. Generated {count} warnings." });
        }
    }
}