using blooming_api.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Suppliers.Queries.GetPurchaseOrders;

public class GetPurchaseOrdersHandler : IRequestHandler<GetPurchaseOrdersQuery, PagedPurchaseOrdersResult>
{
    private readonly AppDbContext _db;

    public GetPurchaseOrdersHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedPurchaseOrdersResult> Handle(GetPurchaseOrdersQuery request, CancellationToken cancellationToken)
    {
        var query = _db.PurchaseOrders
            .Include(p => p.Supplier)
            .Include(p => p.Items)
                .ThenInclude(i => i.ProductVariant)
                    .ThenInclude(v => v.Product)
            .AsQueryable();

        if (request.SupplierId.HasValue)
            query = query.Where(p => p.SupplierId == request.SupplierId.Value);

        if (request.FromDate.HasValue)
            query = query.Where(p => p.OrderDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(p => p.OrderDate <= request.ToDate.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var orders = await query
            .OrderByDescending(p => p.OrderDate)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedPurchaseOrdersResult(
            orders.Select(p => new PurchaseOrderListItemDto(
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
            )).ToList(),
            totalCount,
            request.Page,
            request.PageSize
        );
    }
}
