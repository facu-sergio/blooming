using MediatR;

namespace blooming_api.Modules.Orders.Commands.CreateOrder;

public record OrderItemDto(int ProductVariantId, int Quantity);

public record CreateOrderCommand(
    int CustomerId,
    List<OrderItemDto> Items,
    string? ShippingAddress,
    string? Notes,
    DateTime? EstimatedDeliveryDate,
    int CreatedByUserId
) : IRequest<CreateOrderResult>;

public record CreateOrderResult(int OrderId);
