using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MasafiFleetSync.API.Migrations
{
    /// <inheritdoc />
    public partial class AddLiveTelemetryToWaterOrders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CurrentLatitude",
                table: "WaterOrders",
                type: "decimal(9,6)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "CurrentLongitude",
                table: "WaterOrders",
                type: "decimal(9,6)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CurrentLatitude",
                table: "WaterOrders");

            migrationBuilder.DropColumn(
                name: "CurrentLongitude",
                table: "WaterOrders");
        }
    }
}
