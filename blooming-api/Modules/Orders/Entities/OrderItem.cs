using blooming_api.Common;

namespace blooming_api.Modules.Orders.Entities;

public class OrderItem
{
    public int Id { get; set; }

    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public int ProductVariantId { get; set; }
    public ProductVariant ProductVariant { get; set; } = null!;

    public int Quantity { get; set; }

    /// <summary>Precio de venta de la variante al momento de crear el pedido (precio congelado).</summary>
    public decimal UnitPrice { get; set; }

    /// <summary>UnitPrice × Quantity.</summary>
    public decimal LineTotal { get; set; }
}
