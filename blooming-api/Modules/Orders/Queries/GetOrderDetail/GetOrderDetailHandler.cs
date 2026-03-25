using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Orders.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using static blooming_api.Modules.Orders.Entities.OrderStatusTransitions;

namespace blooming_api.Modules.Orders.Queries.GetOrderDetail;

public class GetOrderDetailHandler : IRequestHandler<GetOrderDetailQuery, OrderDetailDto>
{
    private readonly AppDbContext _db;

    public GetOrderDetailHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<OrderDetailDto> Handle(GetOrderDetailQuery request, CancellationToken cancellationToken)
    {
        var order = await _db.Orders
            .Include(o => o.Customer)
            .Include(o => o.Items)
                .ThenInclude(i => i.ProductVariant)
                    .ThenInclude(v => v.Product)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

        if (order == null)
            throw new NotFoundException($"Pedido con ID {request.OrderId} no encontrado");

        var statusLabel = MapToSpanish(order.Status);
        var statusKey = order.Status.ToString();

        var items = order.Items.Select(i => new OrderItemDetailDto(
            i.Id,
            i.ProductVariantId,
            i.ProductVariant.Product.Name,
            $"{i.ProductVariant.Size} {i.ProductVariant.Color}",
            i.UnitPrice,
            i.Quantity,
            i.LineTotal
        )).ToList();

        return new OrderDetailDto(
            order.Id,
            order.CustomerId,
            order.Customer.Name,
            statusLabel,
            statusKey,
            order.Total,
            order.Discount,
            order.ShippingAddress,
            order.Notes,
            order.EstimatedDeliveryDate,
            order.CreatedAt,
            order.ConfirmedAt,
            order.ShippedAt,
            order.DeliveredAt,
            order.CancelledAt,
            items
        );
    }
}
