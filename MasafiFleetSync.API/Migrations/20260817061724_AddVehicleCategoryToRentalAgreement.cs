using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MasafiFleetSync.API.Migrations
{
    /// <inheritdoc />
    public partial class AddVehicleCategoryToRentalAgreement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "VehicleCategory",
                table: "RentalAgreements",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "VehicleCategory",
                table: "RentalAgreements");
        }
    }
}
