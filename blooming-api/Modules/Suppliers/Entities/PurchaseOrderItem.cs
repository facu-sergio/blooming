using blooming_api.Common;

namespace blooming_api.Modules.Suppliers.Entities;

public class PurchaseOrderItem
{
    public int Id { get; set; }

    public int PurchaseOrderId { get; set; }
    public PurchaseOrder PurchaseOrder { get; set; } = null!;

    public int ProductVariantId { get; set; }
    public ProductVariant ProductVariant { get; set; } = null!;

    public int Quantity { get; set; }

    public decimal UnitCostPrice { get; set; }

    public DateTime CreatedAt { get; set; }
}
