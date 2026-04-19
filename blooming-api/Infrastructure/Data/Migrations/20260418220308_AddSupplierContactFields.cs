using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace blooming_api.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSupplierContactFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "contact_info",
                table: "suppliers");

            migrationBuilder.AddColumn<string>(
                name: "address",
                table: "suppliers",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "phone",
                table: "suppliers",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "website",
                table: "suppliers",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "address",
                table: "suppliers");

            migrationBuilder.DropColumn(
                name: "phone",
                table: "suppliers");

            migrationBuilder.DropColumn(
                name: "website",
                table: "suppliers");

            migrationBuilder.AddColumn<string>(
                name: "contact_info",
                table: "suppliers",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }
    }
}
