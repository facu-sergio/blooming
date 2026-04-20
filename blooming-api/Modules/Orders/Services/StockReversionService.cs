using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Orders.Entities;
using blooming_api.Modules.Products.Entities;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Orders.Services;

/// <summary>
/// Revierte el stock de todas las variantes de un pedido cancelado.
/// Solo debe llamarse cuando el pedido estaba en estado Confirmed o Shipped (el stock ya había sido descontado).
/// </summary>
public class StockReversionService
{
    private readonly AppDbContext _db;

    public StockReversionService(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Revierte el stock de cada variante del pedido e incrementa su cantidad en el inventario.
    /// Registra un movimiento de entrada tipo "In" (Cancellation) por cada ítem.
    /// Debe llamarse dentro de una transacción activa.
    /// </summary>
    public async Task RevertStockForOrderAsync(Order order, DateTime cancelledAt, CancellationToken cancellationToken)
    {
        var variantIds = order.Items.Select(i => i.ProductVariantId).ToList();
        var variants = await _db.ProductVariants
            .Where(v => variantIds.Contains(v.Id))
            .ToListAsync(cancellationToken);

        foreach (var item in order.Items)
        {
            var variant = variants.First(v => v.Id == item.ProductVariantId);
            variant.Stock += item.Quantity;

            _db.StockMovements.Add(new StockMovement
            {
                ProductVariantId = item.ProductVariantId,
                MovementType = MovementType.In,
                Quantity = item.Quantity,
                OrderId = order.Id,
                CreatedAt = cancelledAt,
            });
        }
    }
}
