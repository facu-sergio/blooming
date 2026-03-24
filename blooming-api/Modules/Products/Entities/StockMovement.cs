using blooming_api.Common;

namespace blooming_api.Modules.Products.Entities;

public enum MovementType
{
    In,
    Out
}

public class StockMovement
{
    public int Id { get; set; }
    public int ProductVariantId { get; set; }
    public MovementType MovementType { get; set; }
    public int Quantity { get; set; }
    /// <summary>
    /// FK al pedido (Order) que originó el movimiento. Null si no aplica.
    /// </summary>
    public int? OrderId { get; set; }
    /// <summary>
    /// FK a la orden de compra (PurchaseOrder) que originó el movimiento. Null si no aplica.
    /// </summary>
    public int? PurchaseOrderId { get; set; }
    public DateTime CreatedAt { get; set; }
    public ProductVariant ProductVariant { get; set; } = null!;
}
