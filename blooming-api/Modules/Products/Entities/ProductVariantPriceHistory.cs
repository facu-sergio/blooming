using blooming_api.Common;
using blooming_api.Modules.Suppliers.Entities;

namespace blooming_api.Modules.Products.Entities;

public class ProductVariantPriceHistory
{
    public int Id { get; set; }
    public int ProductVariantId { get; set; }
    public ProductVariant ProductVariant { get; set; } = null!;
    public decimal CostPrice { get; set; }
    public decimal SellingPrice { get; set; }
    public decimal MarkupPercentage { get; set; }
    public int? PurchaseOrderId { get; set; }
    public PurchaseOrder? PurchaseOrder { get; set; }
    public DateTime CreatedAt { get; set; }
}
