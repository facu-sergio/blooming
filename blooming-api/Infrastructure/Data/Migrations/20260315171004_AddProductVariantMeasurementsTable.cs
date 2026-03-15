using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace blooming_api.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddProductVariantMeasurementsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "product_variant_measurements",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    product_variant_id = table.Column<int>(type: "integer", nullable: false),
                    measurement_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    value_in_cm = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_product_variant_measurements", x => x.id);
                    table.ForeignKey(
                        name: "FK_product_variant_measurements_product_variants_product_varia~",
                        column: x => x.product_variant_id,
                        principalTable: "product_variants",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_product_variant_measurements_product_variant_id_measurement~",
                table: "product_variant_measurements",
                columns: new[] { "product_variant_id", "measurement_name" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "product_variant_measurements");
        }
    }
}
