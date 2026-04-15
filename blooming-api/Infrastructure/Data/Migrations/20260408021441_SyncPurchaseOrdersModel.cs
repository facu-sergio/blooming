using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace blooming_api.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class SyncPurchaseOrdersModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_stock_movements_purchase_orders_purchase_order_id",
                table: "stock_movements");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddForeignKey(
                name: "FK_stock_movements_purchase_orders_purchase_order_id",
                table: "stock_movements",
                column: "purchase_order_id",
                principalTable: "purchase_orders",
                principalColumn: "id");
        }
    }
}
