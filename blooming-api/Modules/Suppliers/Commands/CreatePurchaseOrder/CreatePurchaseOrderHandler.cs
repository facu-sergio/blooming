using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Products.Entities;
using blooming_api.Modules.Suppliers.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Suppliers.Commands.CreatePurchaseOrder;

public class CreatePurchaseOrderHandler : IRequestHandler<CreatePurchaseOrderCommand, CreatePurchaseOrderResult>
{
    private readonly AppDbContext _db;

    public CreatePurchaseOrderHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<CreatePurchaseOrderResult> Handle(CreatePurchaseOrderCommand request, CancellationToken cancellationToken)
    {
        var supplierExists = await _db.Suppliers
            .AnyAsync(s => s.Id == request.SupplierId, cancellationToken);

        if (!supplierExists)
            throw new NotFoundException($"Proveedor con ID {request.SupplierId} no encontrado");

        var variantIds = request.Items.Select(i => i.ProductVariantId).Distinct().ToList();
        var variants = await _db.ProductVariants
            .Where(v => variantIds.Contains(v.Id))
            .ToListAsync(cancellationToken);

        if (variants.Count != variantIds.Count)
            throw new NotFoundException("Una o más variantes de producto no fueron encontradas");

        var now = DateTime.UtcNow;
        var orderDate = request.OrderDate?.ToUniversalTime() ?? now;

        var items = request.Items.Select(i => new PurchaseOrderItem
        {
            ProductVariantId = i.ProductVariantId,
            Quantity = i.Quantity,
            UnitCostPrice = i.UnitCostPrice,
            CreatedAt = now
        }).ToList();

        var totalAmount = items.Sum(i => i.UnitCostPrice * i.Quantity);

        var purchaseOrder = new PurchaseOrder
        {
            SupplierId = request.SupplierId,
            OrderDate = orderDate,
            TotalAmount = totalAmount,
            Items = items,
            CreatedAt = now,
            UpdatedAt = now
        };

        using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            _db.PurchaseOrders.Add(purchaseOrder);
            await _db.SaveChangesAsync(cancellationToken);

            foreach (var requestItem in request.Items)
            {
                var variant = variants.First(v => v.Id == requestItem.ProductVariantId);

                variant.Stock += requestItem.Quantity;
                variant.CostPrice = requestItem.UnitCostPrice;
                variant.UpdatedAt = now;

                _db.StockMovements.Add(new StockMovement
                {
                    ProductVariantId = requestItem.ProductVariantId,
                    MovementType = MovementType.In,
                    Quantity = requestItem.Quantity,
                    PurchaseOrderId = purchaseOrder.Id,
                    UnitCostPrice = requestItem.UnitCostPrice,
                    CreatedAt = now
                });
            }

            await _db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return new CreatePurchaseOrderResult(purchaseOrder.Id, purchaseOrder.TotalAmount, purchaseOrder.CreatedAt);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
