namespace blooming_api.Modules.Suppliers.Entities;

public class PurchaseOrder
{
    public int Id { get; set; }

    public Guid SupplierId { get; set; }
    public Supplier Supplier { get; set; } = null!;

    public DateTime OrderDate { get; set; }

    public decimal TotalAmount { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public List<PurchaseOrderItem> Items { get; set; } = new();
}
