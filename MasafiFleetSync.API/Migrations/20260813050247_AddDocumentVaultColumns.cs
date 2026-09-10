using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MasafiFleetSync.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentVaultColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DocumentCopyUrl",
                table: "Drivers",
                newName: "PhotosDocumentUrl");

            migrationBuilder.AddColumn<string>(
                name: "InsuranceDocumentUrl",
                table: "Drivers",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "MulkiyaDocumentUrl",
                table: "Drivers",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InsuranceDocumentUrl",
                table: "Drivers");

            migrationBuilder.DropColumn(
                name: "MulkiyaDocumentUrl",
                table: "Drivers");

            migrationBuilder.RenameColumn(
                name: "PhotosDocumentUrl",
                table: "Drivers",
                newName: "DocumentCopyUrl");
        }
    }
}
