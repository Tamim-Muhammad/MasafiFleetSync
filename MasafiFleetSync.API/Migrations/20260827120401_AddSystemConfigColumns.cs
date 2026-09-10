using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MasafiFleetSync.API.Migrations
{
    /// <inheritdoc />
    public partial class AddSystemConfigColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AutoBackupEnabled",
                table: "SystemConfigs",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ComplianceAlertThreshold",
                table: "SystemConfigs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "GeofenceZone",
                table: "SystemConfigs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AutoBackupEnabled",
                table: "SystemConfigs");

            migrationBuilder.DropColumn(
                name: "ComplianceAlertThreshold",
                table: "SystemConfigs");

            migrationBuilder.DropColumn(
                name: "GeofenceZone",
                table: "SystemConfigs");
        }
    }
}
