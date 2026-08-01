using Microsoft.EntityFrameworkCore;
using MasafiFleetSync.API.Models;
using System;
using System.Linq;

namespace MasafiFleetSync.API.Data
{
    public static class DbInitializer
    {
        public static void Initialize(AppDbContext context)
        {
            // Enforce automatic pending database migrations execution checks on app startup
            context.Database.Migrate();

            // Look for any existing system configurations to see if database has already been initialized
            if (context.SystemConfigs.Any())
            {
                return; // Database has been seeded already
            }

            // 1. Pre-seed the core pricing parameters matching SRS FR.29 & FR.30 operational variables
            var defaultSettings = new SystemConfig
            {
                BaseRate = 150.00m,                        // Base fee in AED
                PerKmRate = 5.50m,                          // Per-kilometer rate multiplier factor
                VolumeMultiplier = 1.00m,                   // Default asset scale baseline
                CompanyCommissionPercentage = 15.00m,      // Corporate cut percentage
                CenterLatitude = 25.3007,                  // Masafi Center point marker
                CenterLongitude = 56.1679,
                AllowedRadiusKm = 50.0                     // Perimeter constraint scale bounds
            };
            context.SystemConfigs.Add(defaultSettings);

            // 2. Pre-seed baseline security profiles targeting role authorization gateways (Screen 2 Portal Access)
            var adminUser = new User
            {
                FullName = "Al-Waqar Dispatch Admin",
                Email = "admin@alwaqar.ae",
                PhoneNumber = "+971501234567",
                PasswordHash = "AdminSecurePass123!",       // Scaffolding raw password string for testing
                Role = "SuperAdmin",
                AccountStatus = "Active",
                FailedLoginAttempts = 0,
                CreatedAt = DateTime.UtcNow
            };

            var testCustomer = new User
            {
                FullName = "Masafi Commercial Client",
                Email = "customer@masafibuyer.com",
                PhoneNumber = "+971507654321",
                PasswordHash = "CustomerPass123!",
                Role = "Customer",
                AccountStatus = "Active",
                FailedLoginAttempts = 0,
                CreatedAt = DateTime.UtcNow
            };

            context.Users.AddRange(adminUser, testCustomer);

            // Commit transaction changes securely to SQL Server
            context.SaveChanges();
        }
    }
}