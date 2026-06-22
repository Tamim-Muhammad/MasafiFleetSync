using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MasafiFleetSync.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialAlWaqarSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Location",
                table: "Breakdowns");

            migrationBuilder.AddColumn<string>(
                name: "ChassisNumber",
                table: "Vehicles",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "InsuranceDocumentUrl",
                table: "Vehicles",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Vehicles",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<string>(
                name: "VehiclePhotoUrl",
                table: "Vehicles",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "YearOfManufacture",
                table: "Vehicles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "WaterOrderId",
                table: "Trips",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "DailyRate",
                table: "RentalAgreements",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "DrivingLicenseDocumentUrl",
                table: "Drivers",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LicenseIssuingAuthority",
                table: "Drivers",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<int>(
                name: "VehicleId",
                table: "Breakdowns",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "DriverId",
                table: "Breakdowns",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<string>(
                name: "CallerName",
                table: "Breakdowns",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CallerPhone",
                table: "Breakdowns",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "IncidentLatitude",
                table: "Breakdowns",
                type: "decimal(9,6)",
                precision: 9,
                scale: 6,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "IncidentLongitude",
                table: "Breakdowns",
                type: "decimal(9,6)",
                precision: 9,
                scale: 6,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "WaterOrders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    AssignedVehicleId = table.Column<int>(type: "int", nullable: true),
                    AssignedDriverId = table.Column<int>(type: "int", nullable: true),
                    TargetLatitude = table.Column<decimal>(type: "decimal(9,6)", precision: 9, scale: 6, nullable: false),
                    TargetLongitude = table.Column<decimal>(type: "decimal(9,6)", precision: 9, scale: 6, nullable: false),
                    CalculatedDistanceKm = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GrossAmountAED = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CommissionDeductionAED = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DriverNetEarningsAED = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CustodyStatus = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    OrderStatus = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    OrderTimestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    HandoverTimestamp = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WaterOrders", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_VehicleNumber",
                table: "Vehicles",
                column: "VehicleNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_PhoneNumber",
                table: "Users",
                column: "PhoneNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Trips_WaterOrderId",
                table: "Trips",
                column: "WaterOrderId");

            migrationBuilder.AddForeignKey(
                name: "FK_Trips_WaterOrders_WaterOrderId",
                table: "Trips",
                column: "WaterOrderId",
                principalTable: "WaterOrders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Trips_WaterOrders_WaterOrderId",
                table: "Trips");

            migrationBuilder.DropTable(
                name: "WaterOrders");

            migrationBuilder.DropIndex(
                name: "IX_Vehicles_VehicleNumber",
                table: "Vehicles");

            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_PhoneNumber",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Trips_WaterOrderId",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "ChassisNumber",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "InsuranceDocumentUrl",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "VehiclePhotoUrl",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "YearOfManufacture",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "WaterOrderId",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "DailyRate",
                table: "RentalAgreements");

            migrationBuilder.DropColumn(
                name: "DrivingLicenseDocumentUrl",
                table: "Drivers");

            migrationBuilder.DropColumn(
                name: "LicenseIssuingAuthority",
                table: "Drivers");

            migrationBuilder.DropColumn(
                name: "CallerName",
                table: "Breakdowns");

            migrationBuilder.DropColumn(
                name: "CallerPhone",
                table: "Breakdowns");

            migrationBuilder.DropColumn(
                name: "IncidentLatitude",
                table: "Breakdowns");

            migrationBuilder.DropColumn(
                name: "IncidentLongitude",
                table: "Breakdowns");

            migrationBuilder.AlterColumn<int>(
                name: "VehicleId",
                table: "Breakdowns",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "DriverId",
                table: "Breakdowns",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Breakdowns",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");
        }
    }
}
