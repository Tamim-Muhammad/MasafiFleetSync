using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MasafiFleetSync.API.Migrations
{
    /// <inheritdoc />
    public partial class AddProfileImageToDriver : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProfileImage",
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
                name: "ProfileImage",
                table: "Drivers");
        }
    }
}
