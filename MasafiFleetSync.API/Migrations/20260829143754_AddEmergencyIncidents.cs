using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MasafiFleetSync.API.Migrations
{
    /// <inheritdoc />
    public partial class AddEmergencyIncidents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EmergencyIncidents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IncidentNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RelatedOrder = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RelatedVehicle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReportedByUserId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EmergencyType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmergencyIncidents", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EmergencyIncidents");
        }
    }
}
