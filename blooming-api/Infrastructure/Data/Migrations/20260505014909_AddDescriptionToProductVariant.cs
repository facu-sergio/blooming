using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace blooming_api.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDescriptionToProductVariant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "description",
                table: "product_variants",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "description",
                table: "product_variants");
        }
    }
}
