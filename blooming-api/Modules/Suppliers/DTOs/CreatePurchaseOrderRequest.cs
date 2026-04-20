namespace blooming_api.Modules.Suppliers.DTOs;

public class CreatePurchaseOrderItemRequest
{
    public int ProductVariantId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitCostPrice { get; set; }
}

public class CreatePurchaseOrderRequest
{
    public Guid SupplierId { get; set; }
    public List<CreatePurchaseOrderItemRequest> Items { get; set; } = new();
    public DateTime? OrderDate { get; set; }
}
