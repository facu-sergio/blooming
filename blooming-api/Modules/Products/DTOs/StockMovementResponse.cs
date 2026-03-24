namespace blooming_api.Modules.Products.DTOs;

public class StockMovementResponse
{
    public int Id { get; set; }
    public string MovementType { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public int? OrderId { get; set; }
    public int? PurchaseOrderId { get; set; }
    public DateTime CreatedAt { get; set; }
}
