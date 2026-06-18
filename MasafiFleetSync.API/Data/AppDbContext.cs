using Microsoft.EntityFrameworkCore;
using MasafiFleetSync.API.Models;

namespace MasafiFleetSync.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // Core System User Registries
        public DbSet<User> Users { get; set; }
        public DbSet<Driver> Drivers { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }

        // Module 1: Water Tanker Scheduling (LMS)
        public DbSet<Trip> Trips { get; set; }

        // Module 2: Driver & Vehicle Registration (Compliance)
        public DbSet<Alert> Alerts { get; set; }

        // Module 3: Vehicle Rental Management
        public DbSet<RentalAgreement> RentalAgreements { get; set; }

        // Module 4: Recovery Dispatch (On-Call)
        public DbSet<Breakdown> Breakdowns { get; set; }

        // Central Admin Pricing & Operations Controls
        public DbSet<SystemConfig> SystemConfigs { get; set; }
    }
}