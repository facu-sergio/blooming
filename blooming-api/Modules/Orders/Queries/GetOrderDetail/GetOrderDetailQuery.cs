using MediatR;

namespace blooming_api.Modules.Orders.Queries.GetOrderDetail;

public record GetOrderDetailQuery(int OrderId) : IRequest<OrderDetailDto>;

public record OrderDetailDto(
    int Id,
    int CustomerId,
    string CustomerName,
    string Status,
    string StatusKey,
    decimal Total,
    decimal? Discount,
    string? ShippingAddress,
    string? Notes,
    DateTime? EstimatedDeliveryDate,
    DateTime CreatedAt,
    DateTime? ConfirmedAt,
    DateTime? ShippedAt,
    DateTime? DeliveredAt,
    DateTime? CancelledAt,
    List<OrderItemDetailDto> Items
);

public record OrderItemDetailDto(
    int Id,
    int ProductVariantId,
    string ProductName,
    string VariantLabel,
    decimal UnitPrice,
    int Quantity,
    decimal LineTotal
);
