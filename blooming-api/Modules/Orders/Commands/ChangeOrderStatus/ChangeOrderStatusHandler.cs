using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Orders.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Orders.Commands.ChangeOrderStatus;

public class ChangeOrderStatusHandler : IRequestHandler<ChangeOrderStatusCommand, ChangeOrderStatusResult>
{
    private readonly AppDbContext _db;

    public ChangeOrderStatusHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ChangeOrderStatusResult> Handle(ChangeOrderStatusCommand request, CancellationToken cancellationToken)
    {
        var order = await _db.Orders
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

        if (order == null)
            throw new NotFoundException($"Pedido con ID {request.OrderId} no encontrado");

        var newStatus = Enum.Parse<OrderStatus>(request.NewStatus);

        if (!OrderStatusTransitions.IsValidTransition(order.Status, newStatus))
            throw new BusinessRuleException(
                OrderStatusTransitions.GetTransitionErrorMessage(order.Status, newStatus));

        using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var changedAt = DateTime.UtcNow;

            order.Status = newStatus;
            order.UpdatedAt = changedAt;

            // Registrar timestamp de la transición correspondiente
            // Nota: Confirmed ya es manejado por ConfirmOrderHandler (Historia 4.2)
            switch (newStatus)
            {
                case OrderStatus.Shipped:
                    order.ShippedAt = changedAt;
                    break;
                case OrderStatus.Delivered:
                    order.DeliveredAt = changedAt;
                    break;
                case OrderStatus.Cancelled:
                    order.CancelledAt = changedAt;
                    break;
            }

            await _db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return new ChangeOrderStatusResult(
                order.Id,
                OrderStatusTransitions.MapToSpanish(newStatus),
                changedAt);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
