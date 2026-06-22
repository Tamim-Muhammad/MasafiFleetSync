using Microsoft.EntityFrameworkCore;
using MasafiFleetSync.API.Models;

namespace MasafiFleetSync.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // --- Core System User Registries ---
        public DbSet<User> Users { get; set; }
        public DbSet<Driver> Drivers { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }

        // --- Module 1: Water Tanker Scheduling (LMS) ---
        public DbSet<WaterOrder> WaterOrders { get; set; } // FIX: Registered missing core order table
        public DbSet<Trip> Trips { get; set; }

        // --- Module 2: Driver & Vehicle Registration (Compliance) ---
        public DbSet<Alert> Alerts { get; set; }

        // --- Module 3: Vehicle Rental Management ---
        public DbSet<RentalAgreement> RentalAgreements { get; set; }

        // --- Module 4: Recovery Dispatch (On-Call) ---
        public DbSet<Breakdown> Breakdowns { get; set; }

        // --- Central Admin Pricing & Operations Controls ---
        public DbSet<SystemConfig> SystemConfigs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. Enforce unique system lookup constraint indices to accelerate back-office lookups
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.PhoneNumber)
                .IsUnique();

            modelBuilder.Entity<Vehicle>()
                .HasIndex(v => v.VehicleNumber)
                .IsUnique();

            // 2. Lock explicit precision boundaries protecting spatial coordinates accuracy
            modelBuilder.Entity<WaterOrder>()
                .Property(o => o.TargetLatitude)
                .HasPrecision(9, 6);

            modelBuilder.Entity<WaterOrder>()
                .Property(o => o.TargetLongitude)
                .HasPrecision(9, 6);

            modelBuilder.Entity<Breakdown>()
                .Property(b => b.IncidentLatitude)
                .HasPrecision(9, 6);

            modelBuilder.Entity<Breakdown>()
                .Property(b => b.IncidentLongitude)
                .HasPrecision(9, 6);

            // 3. Configure DB optimistic concurrency handling token for simultaneous operator requests
            modelBuilder.Entity<Vehicle>()
                .Property(v => v.RowVersion)
                .IsRowVersion();
        }
    }
}