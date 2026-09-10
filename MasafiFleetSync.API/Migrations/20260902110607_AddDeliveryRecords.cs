using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MasafiFleetSync.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDeliveryRecords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DeliveryRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DriverId = table.Column<int>(type: "int", nullable: false),
                    JobReference = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ClientName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    ServiceDescription = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Location = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeliveryRecords", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DeliveryRecords");
        }
    }
}
