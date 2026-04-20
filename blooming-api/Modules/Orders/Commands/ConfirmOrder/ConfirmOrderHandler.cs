using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Orders.Entities;
using blooming_api.Modules.Products.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Orders.Commands.ConfirmOrder;

public class ConfirmOrderHandler : IRequestHandler<ConfirmOrderCommand, ConfirmOrderResult>
{
    private readonly AppDbContext _db;

    public ConfirmOrderHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ConfirmOrderResult> Handle(ConfirmOrderCommand request, CancellationToken cancellationToken)
    {
        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

        if (order == null)
            throw new NotFoundException($"Pedido con ID {request.OrderId} no encontrado");

        if (order.Status != OrderStatus.Pending)
            throw new NotFoundException($"El pedido {request.OrderId} no está en estado Pendiente");

        var variantIds = order.Items.Select(i => i.ProductVariantId).ToList();
        var variants = await _db.ProductVariants
            .Where(v => variantIds.Contains(v.Id))
            .ToListAsync(cancellationToken);

        // Verificar stock suficiente ANTES de cualquier modificación (atomicidad)
        foreach (var item in order.Items)
        {
            var variant = variants.First(v => v.Id == item.ProductVariantId);
            if (variant.Stock < item.Quantity)
                throw new BusinessRuleException(
                    $"Stock insuficiente para {variant.Size} {variant.Color}. " +
                    $"Disponible: {variant.Stock}, requerido: {item.Quantity}");
        }

        using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var confirmedAt = DateTime.UtcNow;

            foreach (var item in order.Items)
            {
                var variant = variants.First(v => v.Id == item.ProductVariantId);
                variant.Stock -= item.Quantity;

                _db.StockMovements.Add(new StockMovement
                {
                    ProductVariantId = item.ProductVariantId,
                    MovementType = MovementType.Out,
                    Quantity = item.Quantity,
                    OrderId = order.Id,
                    CreatedAt = confirmedAt
                });
            }

            order.Status = OrderStatus.Confirmed;
            order.ConfirmedAt = confirmedAt;
            order.UpdatedAt = confirmedAt;

            await _db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return new ConfirmOrderResult(order.Id, nameof(OrderStatus.Confirmed), confirmedAt);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
