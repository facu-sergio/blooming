using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Suppliers.Queries.GetPurchaseOrderDetail;

public class GetPurchaseOrderDetailHandler : IRequestHandler<GetPurchaseOrderDetailQuery, PurchaseOrderDetailDto>
{
    private readonly AppDbContext _db;

    public GetPurchaseOrderDetailHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PurchaseOrderDetailDto> Handle(GetPurchaseOrderDetailQuery request, CancellationToken cancellationToken)
    {
        var order = await _db.PurchaseOrders
            .Include(p => p.Supplier)
            .Include(p => p.Items)
                .ThenInclude(i => i.ProductVariant)
                    .ThenInclude(v => v.Product)
            .Include(p => p.Items)
                .ThenInclude(i => i.ProductVariant)
                    .ThenInclude(v => v.Size)
            .Include(p => p.Items)
                .ThenInclude(i => i.ProductVariant)
                    .ThenInclude(v => v.Color)
            .FirstOrDefaultAsync(p => p.Id == request.PurchaseOrderId, cancellationToken);

        if (order == null)
            throw new NotFoundException($"Orden de compra con ID {request.PurchaseOrderId} no encontrada");

        var items = order.Items.Select(i => new PurchaseOrderItemDetailDto(
            i.Id,
            i.ProductVariantId,
            i.ProductVariant.Product.Name,
            $"{i.ProductVariant.Size.DisplayName} {i.ProductVariant.Color.DisplayName}",
            i.Quantity,
            i.UnitCostPrice,
            i.UnitCostPrice * i.Quantity
        )).ToList();

        return new PurchaseOrderDetailDto(
            order.Id,
            order.SupplierId,
            order.Supplier.Name,
            order.OrderDate,
            order.TotalAmount,
            order.CreatedAt,
            order.UpdatedAt,
            items
        );
    }
}
