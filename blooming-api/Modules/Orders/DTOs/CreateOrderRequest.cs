namespace blooming_api.Modules.Orders.DTOs;

public class CreateOrderItemRequest
{
    public int ProductVariantId { get; set; }
    public int Quantity { get; set; }
}

public class CreateOrderRequest
{
    public int CustomerId { get; set; }
    public List<CreateOrderItemRequest> Items { get; set; } = new();
    public string? ShippingAddress { get; set; }
    public string? Notes { get; set; }
    public DateTime? EstimatedDeliveryDate { get; set; }
}
