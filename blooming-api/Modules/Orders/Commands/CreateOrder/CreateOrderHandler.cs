using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Orders.Entities;
using blooming_api.Modules.Products.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Orders.Commands.CreateOrder;

public class CreateOrderHandler : IRequestHandler<CreateOrderCommand, CreateOrderResult>
{
    private readonly AppDbContext _db;

    public CreateOrderHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<CreateOrderResult> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        var customerExists = await _db.Customers
            .AnyAsync(c => c.Id == request.CustomerId, cancellationToken);

        if (!customerExists)
            throw new NotFoundException($"Cliente con ID {request.CustomerId} no encontrado");

        var variantIds = request.Items.Select(i => i.ProductVariantId).Distinct().ToList();
        var variants = await _db.ProductVariants
            .Where(v => variantIds.Contains(v.Id))
            .ToListAsync(cancellationToken);

        if (variants.Count != variantIds.Count)
            throw new NotFoundException("Una o más variantes de producto no fueron encontradas");

        // Verificar stock suficiente ANTES de cualquier modificación (atomicidad)
        foreach (var item in request.Items)
        {
            var variant = variants.First(v => v.Id == item.ProductVariantId);
            if (variant.Stock < item.Quantity)
                throw new BusinessRuleException(
                    $"Stock insuficiente para la variante {variant.Size} {variant.Color}. " +
                    $"Disponible: {variant.Stock}, solicitado: {item.Quantity}");
        }

        var orderItems = request.Items.Select(item =>
        {
            var variant = variants.First(v => v.Id == item.ProductVariantId);
            return new OrderItem
            {
                ProductVariantId = item.ProductVariantId,
                Quantity = item.Quantity,
                UnitPrice = variant.SellingPrice,
                LineTotal = variant.SellingPrice * item.Quantity,
                CostPriceAtSale = variant.CostPrice
            };
        }).ToList();

        var total = orderItems.Sum(i => i.LineTotal);
        var confirmedAt = DateTime.UtcNow;

        var order = new Order
        {
            CustomerId = request.CustomerId,
            Status = OrderStatus.Confirmed,
            ConfirmedAt = confirmedAt,
            Total = total,
            ShippingAddress = request.ShippingAddress,
            Notes = request.Notes,
            EstimatedDeliveryDate = request.EstimatedDeliveryDate,
            CreatedByUserId = request.CreatedByUserId,
            Items = orderItems,
            CreatedAt = confirmedAt
        };

        using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            _db.Orders.Add(order);
            await _db.SaveChangesAsync(cancellationToken);

            foreach (var item in request.Items)
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

            await _db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }

        return new CreateOrderResult(order.Id);
    }
}
