using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MasafiFleetSync.API.Migrations
{
    /// <inheritdoc />
    public partial class AddB2BLeaseFieldsToModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CompanyName",
                table: "RentalAgreements",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ContactPhone",
                table: "RentalAgreements",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsDriverCertified",
                table: "RentalAgreements",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "TradeLicenseNo",
                table: "RentalAgreements",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompanyName",
                table: "RentalAgreements");

            migrationBuilder.DropColumn(
                name: "ContactPhone",
                table: "RentalAgreements");

            migrationBuilder.DropColumn(
                name: "IsDriverCertified",
                table: "RentalAgreements");

            migrationBuilder.DropColumn(
                name: "TradeLicenseNo",
                table: "RentalAgreements");
        }
    }
}
