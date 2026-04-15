using blooming_api.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Suppliers.Queries.GetPurchaseOrders;

public class GetPurchaseOrdersHandler : IRequestHandler<GetPurchaseOrdersQuery, List<PurchaseOrderListItemDto>>
{
    private readonly AppDbContext _db;

    public GetPurchaseOrdersHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<PurchaseOrderListItemDto>> Handle(GetPurchaseOrdersQuery request, CancellationToken cancellationToken)
    {
        var orders = await _db.PurchaseOrders
            .Include(p => p.Supplier)
            .Include(p => p.Items)
                .ThenInclude(i => i.ProductVariant)
                    .ThenInclude(v => v.Product)
            .Where(p => !request.SupplierId.HasValue || p.SupplierId == request.SupplierId.Value)
            .OrderByDescending(p => p.OrderDate)
            .ToListAsync(cancellationToken);

        return orders.Select(p => new PurchaseOrderListItemDto(
            p.Id,
            p.SupplierId,
            p.Supplier.Name,
            p.OrderDate,
            p.TotalAmount,
            p.Items.Count,
            p.CreatedAt,
            p.Items.Select(i => new PurchaseOrderItemSummaryDto(
                i.ProductVariant.Product.Name,
                i.ProductVariant.Product.ImageUrl
            )).ToList()
        )).ToList();
    }
}
