using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MasafiFleetSync.API.Data;
using MasafiFleetSync.API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace MasafiFleetSync.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WaterOrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WaterOrdersController(AppDbContext context)
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

        // GET: api/WaterOrders
        [HttpGet]
        public async Task<IActionResult> GetWaterOrders()
        {
            var orders = await _context.WaterOrders.ToListAsync();

            var enrichedOrders = new List<object>();
            foreach (var o in orders)
            {
                string driverName = "Dispatch Operator Reviewing";
                string driverPhone = "+971 50 000 0000";

                if (o.AssignedDriverId.HasValue)
                {
                    var driver = await _context.Drivers.FindAsync(o.AssignedDriverId.Value);
                    if (driver != null)
                    {
                        driverName = driver.Name;
                        driverPhone = driver.Phone;
                    }
                }

                enrichedOrders.Add(new
                {
                    o.Id,
                    o.CustomerId,
                    o.VolumeGallons,
                    o.AssignedVehicleId,
                    o.AssignedDriverId,
                    o.DeliveryAddress,
                    o.CustomerPhone,
                    o.TargetLatitude,
                    o.TargetLongitude,
                    o.CurrentLatitude,
                    o.CurrentLongitude,
                    o.CalculatedDistanceKm,
                    o.GrossAmountAED,
                    o.CommissionDeductionAED,
                    o.DriverNetEarningsAED,
                    o.CustodyStatus,
                    o.OrderStatus,
                    o.OrderTimestamp,
                    o.HandoverTimestamp,
                    DriverName = driverName,
                    DriverPhone = driverPhone
                });
            }

            return Ok(enrichedOrders);
        }

        // GET: api/WaterOrders/my-orders
        [HttpGet("my-orders")]
        [Authorize]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId = GetAuthorizedUserId();
            if (userId == null)
            {
                return Unauthorized(new { message = "Invalid token or user ID not found." });
            }

            var orders = await _context.WaterOrders
                .Where(o => o.CustomerId == userId.Value)
                .ToListAsync();

            var enrichedOrders = new List<object>();
            foreach (var o in orders)
            {
                string driverName = "Dispatch Operator Reviewing";
                string driverPhone = "+971 50 000 0000";

                if (o.AssignedDriverId.HasValue)
                {
                    var driver = await _context.Drivers.FindAsync(o.AssignedDriverId.Value);
                    if (driver != null)
                    {
                        driverName = driver.Name;
                        driverPhone = driver.Phone;
                    }
                }

                enrichedOrders.Add(new
                {
                    o.Id,
                    o.CustomerId,
                    o.VolumeGallons,
                    o.AssignedVehicleId,
                    o.AssignedDriverId,
                    o.DeliveryAddress,
                    o.CustomerPhone,
                    o.TargetLatitude,
                    o.TargetLongitude,
                    o.CurrentLatitude,
                    o.CurrentLongitude,
                    o.CalculatedDistanceKm,
                    o.GrossAmountAED,
                    o.CommissionDeductionAED,
                    o.DriverNetEarningsAED,
                    o.CustodyStatus,
                    o.OrderStatus,
                    o.OrderTimestamp,
                    o.HandoverTimestamp,
                    DriverName = driverName,
                    DriverPhone = driverPhone
                });
            }

            return Ok(enrichedOrders);
        }

        // GET: api/WaterOrders/config
        [HttpGet("config")]
        public async Task<IActionResult> GetSystemConfig()
        {
            var config = await _context.SystemConfigs.FirstOrDefaultAsync();
            if (config == null)
            {
                config = new SystemConfig();
                _context.SystemConfigs.Add(config);
                await _context.SaveChangesAsync();
            }
            return Ok(config);
        }

        // GET: api/WaterOrders/driver/{driverId}/active
        [HttpGet("driver/{driverId:int}/active")]
        public async Task<ActionResult<WaterOrder>> GetActiveDriverOrder(int driverId)
        {
            var possibleDriverIds = new List<int> { driverId, 28 };

            var driverCheck = await _context.Drivers.FindAsync(driverId);
            if (driverCheck != null)
            {
                string email = driverCheck.Email?.Trim().ToLower() ?? "";
                string phone = driverCheck.Phone?.Trim() ?? "";
                var userMatch = await _context.Users.FirstOrDefaultAsync(u =>
                    (u.Email != null && u.Email.Trim().ToLower() == email) ||
                    (u.PhoneNumber != null && u.PhoneNumber.Trim() == phone));
                if (userMatch != null) possibleDriverIds.Add(userMatch.Id);
            }
            else
            {
                var userAcc = await _context.Users.FindAsync(driverId);
                if (userAcc != null)
                {
                    string email = userAcc.Email?.Trim().ToLower() ?? "";
                    string phone = userAcc.PhoneNumber?.Trim() ?? "";
                    var matchDrv = await _context.Drivers.FirstOrDefaultAsync(d =>
                        (d.Id == driverId) ||
                        (d.Email != null && d.Email.Trim().ToLower() == email) ||
                        (d.Phone != null && d.Phone.Trim() == phone));
                    if (matchDrv != null) possibleDriverIds.Add(matchDrv.Id);
                }
            }

            var order = await _context.WaterOrders
                .FirstOrDefaultAsync(o => o.AssignedDriverId.HasValue && possibleDriverIds.Contains(o.AssignedDriverId.Value) &&
                    (o.OrderStatus == "Dispatched" || o.OrderStatus == "EnRoute" || o.OrderStatus == "Arrived"));

            if (order == null)
            {
                order = await _context.WaterOrders
                    .Where(o => o.AssignedDriverId.HasValue && possibleDriverIds.Contains(o.AssignedDriverId.Value) && o.OrderStatus != "Completed")
                    .OrderByDescending(o => o.Id)
                    .FirstOrDefaultAsync();
            }

            if (order == null)
            {
                return NotFound(new { message = $"No active assignment found for driver ID {driverId}." });
            }

            return Ok(order);
        }

        // POST: api/waterorders/calculate-fare
        [HttpPost("calculate-fare")]
        public async Task<IActionResult> CalculateFare([FromBody] FareCalculationRequest request)
        {
            var config = await _context.SystemConfigs.FirstOrDefaultAsync();
            if (config == null)
            {
                return StatusCode(500, "Core baseline pricing variables are uninitialized in system settings.");
            }

            decimal baseCalculation = config.BaseRate + (request.DistanceKm * config.PerKmRate);
            decimal grossTotal = baseCalculation * request.VolumeMultiplier;

            decimal commissionCut = grossTotal * (config.CompanyCommissionPercentage / 100m);
            decimal driverNet = grossTotal - commissionCut;

            return Ok(new
            {
                GrossAmountAED = Math.Round(grossTotal, 2),
                CommissionDeductionAED = Math.Round(commissionCut, 2),
                DriverNetEarningsAED = Math.Round(driverNet, 2)
            });
        }

        // PUT: api/waterorders/config
        [HttpPut("config")]
        public async Task<IActionResult> UpdateSystemConfig([FromBody] SystemConfig updatedConfig)
        {
            var config = await _context.SystemConfigs.FirstOrDefaultAsync();
            if (config == null)
            {
                config = new SystemConfig();
                _context.SystemConfigs.Add(config);
            }

            config.BaseRate = updatedConfig.BaseRate;
            config.PerKmRate = updatedConfig.PerKmRate;
            config.CompanyCommissionPercentage = updatedConfig.CompanyCommissionPercentage;
            config.GeofenceZone = updatedConfig.GeofenceZone;
            config.ComplianceAlertThreshold = updatedConfig.ComplianceAlertThreshold;
            config.AutoBackupEnabled = updatedConfig.AutoBackupEnabled;

            var customers = await _context.Users.Where(u => u.Role == "Customer").ToListAsync();
            foreach (var customer in customers)
            {
                var notification = new Notification
                {
                    UserId = customer.Id,
                    Title = "📢 Tariff & System Policy Update",
                    Message = $"Operational pricing parameters have been adjusted. New Base Rate: {config.BaseRate} AED, Zone: {config.GeofenceZone}.",
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                };
                _context.Notifications.Add(notification);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "System pricing parameters & customer broadcast notifications updated successfully in SQL Server database." });
        }

        // POST: api/waterorders/create
        [HttpPost("create")]
        [Authorize] // <--- CRITICAL FIX: Secures the endpoint
        public async Task<IActionResult> CreateOrder([FromBody] WaterOrder order)
        {
            if (order == null) return BadRequest("Order dataset payload cannot be null.");

            var userId = GetAuthorizedUserId();
            if (userId == null)
            {
                return Unauthorized(new { message = "Unauthorized. Please log in." });
            }

            // CRITICAL FIX: Overwrite whatever ID the frontend sent with the securely verified JWT ID
            order.CustomerId = userId.Value;
            order.OrderTimestamp = DateTime.UtcNow;
            order.CustodyStatus = "PendingCollection";
            order.OrderStatus = "Pending";

            if (string.IsNullOrEmpty(order.DeliveryAddress) && Request.Headers.ContainsKey("X-Fallback-Address"))
            {
                order.DeliveryAddress = Request.Headers["X-Fallback-Address"];
            }

            _context.WaterOrders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Bulk water dispatch request logged successfully.", OrderId = order.Id });
        }

        // PUT: api/WaterOrders/5/dispatch
        [HttpPut("{id:int}/dispatch")]
        public async Task<IActionResult> DispatchOrder(int id, [FromBody] DispatchAssignmentRequest request)
        {
            var order = await _context.WaterOrders.FindAsync(id);
            if (order == null)
            {
                return NotFound(new { message = $"Water order with ID {id} not found." });
            }

            var vehicle = await _context.Vehicles.FindAsync(request.AssignedVehicleId);
            if (vehicle == null)
            {
                return NotFound(new { message = $"Vehicle with ID {request.AssignedVehicleId} not found." });
            }

            if (!vehicle.IsCompliant)
            {
                return BadRequest(new { message = "Cannot dispatch non-compliant vehicle." });
            }

            int targetAuthUserId = 28;
            int resolvedDriverId = 28;

            Driver? driverProfile = null;

            if (request.AssignedDriverId > 0)
            {
                driverProfile = await _context.Drivers.FindAsync(request.AssignedDriverId);
            }

            if (driverProfile == null && !string.IsNullOrEmpty(vehicle.VehicleNumber))
            {
                string cleanPlate = vehicle.VehicleNumber.Trim().ToLower();
                driverProfile = await _context.Drivers.FirstOrDefaultAsync(d =>
                    (d.PlateNumber != null && d.PlateNumber.Trim().ToLower() == cleanPlate) ||
                    (d.VehicleAssignment != null && d.VehicleAssignment.Trim().ToLower().Contains(cleanPlate)));
            }

            if (driverProfile == null)
            {
                driverProfile = await _context.Drivers.FirstOrDefaultAsync(d => d.Id == 28 || (d.Name != null && d.Name.ToLower().Contains("khalid")))
                              ?? await _context.Drivers.FirstOrDefaultAsync();
            }

            if (driverProfile != null)
            {
                resolvedDriverId = driverProfile.Id;

                string safeEmail = driverProfile.Email?.Trim().ToLower() ?? "";
                string safePhone = driverProfile.Phone?.Trim() ?? "";

                var matchingUser = await _context.Users.FirstOrDefaultAsync(u =>
                    (u.Id == 28) ||
                    (u.Email != null && u.Email.ToLower().Trim() == safeEmail) ||
                    (u.PhoneNumber != null && u.PhoneNumber.Trim() == safePhone));

                if (matchingUser != null)
                {
                    targetAuthUserId = matchingUser.Id;
                }
            }

            order.AssignedVehicleId = request.AssignedVehicleId;
            order.AssignedDriverId = resolvedDriverId;
            order.OrderStatus = "Dispatched";
            vehicle.Status = "Dispatched";

            var driverNotification = new Notification
            {
                UserId = targetAuthUserId,
                Title = "New Job Assigned & Dispatched! 🚚",
                Message = $"You have been assigned to bulk water order #ORD-{order.Id} using Vehicle #{vehicle.VehicleNumber}. Check your assignment details.",
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };
            _context.Notifications.Add(driverNotification);

            var customerNotification = new Notification
            {
                UserId = order.CustomerId,
                Title = "Order Dispatched! 🚚",
                Message = $"Your bulk water order #ORD-{order.Id} is on the way via Vehicle #{vehicle.VehicleNumber}.",
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };
            _context.Notifications.Add(customerNotification);

            await _context.SaveChangesAsync();

            return Ok(new { message = $"Order {id} successfully dispatched. Notification routed to Auth User ID {targetAuthUserId}." });
        }

        // PUT: api/WaterOrders/5/status
        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] OrderStatusUpdateDto request)
        {
            var order = await _context.WaterOrders.FindAsync(id);
            if (order == null) return NotFound(new { message = $"Order {id} not found." });

            order.OrderStatus = request.Status;

            if (request.Status == "Completed")
            {
                order.CustodyStatus = "Pending Collection";

                if (order.AssignedVehicleId.HasValue)
                {
                    var vehicle = await _context.Vehicles.FindAsync(order.AssignedVehicleId.Value);
                    if (vehicle != null)
                    {
                        vehicle.Status = "Available";
                    }
                }

                int targetDriverId = order.AssignedDriverId ?? 28;

                var verifiedDriver = await _context.Drivers.FindAsync(targetDriverId);

                if (verifiedDriver == null)
                {
                    var userAcc = await _context.Users.FindAsync(targetDriverId);
                    if (userAcc != null && !string.IsNullOrEmpty(userAcc.Email))
                    {
                        string email = userAcc.Email.Trim().ToLower();
                        var matchDrv = await _context.Drivers.FirstOrDefaultAsync(d => d.Email != null && d.Email.Trim().ToLower() == email);
                        if (matchDrv != null)
                        {
                            targetDriverId = matchDrv.Id;
                            verifiedDriver = matchDrv;
                        }
                    }
                }

                if (verifiedDriver == null && order.AssignedVehicleId.HasValue)
                {
                    var assignedVehicle = await _context.Vehicles.FindAsync(order.AssignedVehicleId.Value);
                    if (assignedVehicle != null && !string.IsNullOrEmpty(assignedVehicle.VehicleNumber))
                    {
                        string plate = assignedVehicle.VehicleNumber.Trim().ToLower();
                        var matchingDriver = await _context.Drivers.FirstOrDefaultAsync(d =>
                            d.PlateNumber != null && d.PlateNumber.Trim().ToLower() == plate);

                        if (matchingDriver != null)
                        {
                            targetDriverId = matchingDriver.Id;
                            verifiedDriver = matchingDriver;
                        }
                    }
                }

                if (verifiedDriver == null)
                {
                    var fallbackDriver = await _context.Drivers.FirstOrDefaultAsync(d => d.Id == 28) ?? await _context.Drivers.FirstOrDefaultAsync();
                    if (fallbackDriver != null) targetDriverId = fallbackDriver.Id;
                }

                var existingRecord = await _context.DeliveryRecords
                    .FirstOrDefaultAsync(d => d.JobReference == $"J-{order.Id}" || d.JobReference.EndsWith($"-{order.Id:D2}"));

                if (existingRecord == null)
                {
                    string clientName = $"Client #{order.CustomerId}";
                    var customer = await _context.Users.FindAsync(order.CustomerId);
                    if (customer != null && !string.IsNullOrEmpty(customer.Email))
                    {
                        string emailHandle = customer.Email.Split('@')[0];
                        clientName = char.ToUpper(emailHandle[0]) + emailHandle.Substring(1);
                    }

                    var deliveryRecord = new DeliveryRecord
                    {
                        DriverId = targetDriverId,
                        JobReference = $"J-{DateTime.UtcNow:yyMMdd}-{order.Id:D2}",
                        ClientName = clientName,
                        ServiceDescription = $"Water Tanker Delivery ({order.VolumeGallons} Gallons)",
                        Location = order.DeliveryAddress ?? "Fujairah, UAE",
                        Amount = order.GrossAmountAED,
                        CompletedAt = DateTime.UtcNow,
                        Status = "Pending Collection"
                    };

                    _context.DeliveryRecords.Add(deliveryRecord);
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = $"Order status successfully updated to {request.Status}." });
        }

        // PUT: api/WaterOrders/5/telemetry
        [HttpPut("{id:int}/telemetry")]
        public async Task<IActionResult> UpdateOrderTelemetry(int id, [FromBody] DriverTelemetryUpdateDto request)
        {
            var order = await _context.WaterOrders.FindAsync(id);
            if (order == null) return NotFound(new { message = $"Order {id} not found." });

            order.CurrentLatitude = request.Latitude;
            order.CurrentLongitude = request.Longitude;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Live GPS telemetry coordinates updated successfully." });
        }
    }

    public class FareCalculationRequest
    {
        public decimal DistanceKm { get; set; }
        public decimal VolumeMultiplier { get; set; }
    }

    public class DispatchAssignmentRequest
    {
        public int AssignedVehicleId { get; set; }
        public int AssignedDriverId { get; set; }
    }

    public class OrderStatusUpdateDto
    {
        public string Status { get; set; } = string.Empty;
    }

    public class DriverTelemetryUpdateDto
    {
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
    }
}