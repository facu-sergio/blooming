using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace blooming_api.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPriceHistoryAndVariantImageAndCostAtSale : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "image_url",
                table: "product_variants",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "cost_price_at_sale",
                table: "order_items",
                type: "numeric(12,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "product_variant_price_history",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    product_variant_id = table.Column<int>(type: "integer", nullable: false),
                    cost_price = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    selling_price = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    markup_percentage = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    purchase_order_id = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_product_variant_price_history", x => x.id);
                    table.ForeignKey(
                        name: "FK_product_variant_price_history_product_variants_product_vari~",
                        column: x => x.product_variant_id,
                        principalTable: "product_variants",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_product_variant_price_history_purchase_orders_purchase_orde~",
                        column: x => x.purchase_order_id,
                        principalTable: "purchase_orders",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_product_variant_price_history_product_variant_id",
                table: "product_variant_price_history",
                column: "product_variant_id");

            migrationBuilder.CreateIndex(
                name: "IX_product_variant_price_history_purchase_order_id",
                table: "product_variant_price_history",
                column: "purchase_order_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "product_variant_price_history");

            migrationBuilder.DropColumn(
                name: "image_url",
                table: "product_variants");

            migrationBuilder.DropColumn(
                name: "cost_price_at_sale",
                table: "order_items");
        }
    }
}
