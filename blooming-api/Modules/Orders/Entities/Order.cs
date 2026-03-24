using blooming_api.Modules.Customers.Entities;

namespace blooming_api.Modules.Orders.Entities;

public class Order
{
    public int Id { get; set; }

    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    public OrderStatus Status { get; set; }

    /// <summary>Total calculado como suma de LineTotal de cada OrderItem.</summary>
    public decimal Total { get; set; }

    public decimal? Discount { get; set; }

    public string? ShippingAddress { get; set; }

    public string? Notes { get; set; }

    public DateTime? EstimatedDeliveryDate { get; set; }

    public int? CreatedByUserId { get; set; }

    public List<OrderItem> Items { get; set; } = new();

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Timestamps de transiciones de estado
    public DateTime? ConfirmedAt { get; set; }
    public DateTime? ShippedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public DateTime? CancelledAt { get; set; }
}
