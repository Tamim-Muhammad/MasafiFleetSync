using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MasafiFleetSync.API.Data;
using Microsoft.EntityFrameworkCore;
using MasafiFleetSync.API.Models;

namespace MasafiFleetSync.API.Services
{
    public class ComplianceBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ComplianceBackgroundService> _logger;

        public ComplianceBackgroundService(IServiceProvider serviceProvider, ILogger<ComplianceBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Compliance Background Worker started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                        await RunComplianceCheckAsync(context);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while executing automated compliance background check.");
                }

                // Run daily check loop
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }

        private async Task RunComplianceCheckAsync(AppDbContext context)
        {
            var config = await context.SystemConfigs.FirstOrDefaultAsync();
            if (config == null || string.IsNullOrEmpty(config.ComplianceAlertThreshold))
                return;

            // Parse thresholds from admin dropdown string
            int[] alertDays = config.ComplianceAlertThreshold.Contains("45")
                ? new int[] { 45, 30, 14 }
                : new int[] { 30, 15, 7 };

            var drivers = await context.Drivers.ToListAsync();
            var currentDate = DateTime.UtcNow.Date;
            int warningsGenerated = 0;

            foreach (var driver in drivers)
            {
                string cleanPlate = driver.PlateNumber?.Trim().ToLower() ?? "";
                var vehicle = await context.Vehicles.FirstOrDefaultAsync(v => v.VehicleNumber.ToLower() == cleanPlate);

                // Define the 3 mandatory compliance vectors (Explicitly excluding asset inspection photos)
                var complianceVectors = new[]
                {
                    (
                        Name: "Commercial Driving License",
                        Expiry: driver.LicenseExpiryDate,
                        RefNumber: driver.LicenseNumber ?? "CDL-PENDING"
                    ),
                    (
                        Name: "Vehicle Registration (Mulkiya)",
                        Expiry: vehicle?.RegistrationExpiryDate ?? driver.LicenseExpiryDate,
                        RefNumber: vehicle?.MulkiyaNumber ?? driver.PlateNumber ?? "MUL-PENDING"
                    ),
                    (
                        Name: "Vehicle Commercial Insurance",
                        Expiry: vehicle?.InsuranceExpiryDate ?? driver.LicenseExpiryDate,
                        RefNumber: vehicle?.InsurancePolicyNumber ?? driver.ChassisNumber ?? "INS-PENDING"
                    )
                };

                bool hasExpiredDocument = false;

                foreach (var vector in complianceVectors)
                {
                    int daysRemaining = (vector.Expiry.Date - currentDate).Days;

                    // 1. Hard Expiry Check (0 days or past due)
                    if (daysRemaining <= 0)
                    {
                        hasExpiredDocument = true;
                    }
                    // 2. Threshold Warning Check
                    else if (alertDays.Contains(daysRemaining))
                    {
                        bool notificationExists = await context.Notifications.AnyAsync(n =>
                            n.UserId == driver.Id &&
                            n.Title.Contains(vector.Name) &&
                            n.Message.Contains($"{daysRemaining} days") &&
                            n.CreatedAt >= currentDate.AddDays(-1));

                        if (!notificationExists)
                        {
                            var alertNotification = new Notification
                            {
                                UserId = driver.Id,
                                Title = $"{vector.Name} Expiry Warning",
                                Message = $"Your {vector.Name} (Ref: {vector.RefNumber}) will expire in {daysRemaining} days. Please renew it immediately to avoid assignment blockades.",
                                IsRead = false,
                                CreatedAt = DateTime.UtcNow
                            };

                            context.Notifications.Add(alertNotification);
                            warningsGenerated++;
                        }
                    }
                }

                // Automatic enforcement: Ground vehicle & flag non-compliant if any mandatory vector has expired
                if (hasExpiredDocument)
                {
                    driver.ComplianceStatus = "Non-Compliant";
                    if (driver.Status == "Approved / Active")
                    {
                        driver.Status = "Suspended";
                    }
                    if (vehicle != null)
                    {
                        vehicle.IsCompliant = false;
                        vehicle.Status = "Blockaded";
                    }
                }
            }

            await context.SaveChangesAsync();
            _logger.LogInformation("Automated daily compliance check completed successfully. Generated {count} warnings.", warningsGenerated);
        }
    }
}