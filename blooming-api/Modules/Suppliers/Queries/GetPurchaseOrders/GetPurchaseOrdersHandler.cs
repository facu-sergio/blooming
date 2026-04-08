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
        var query = _db.PurchaseOrders
            .Include(p => p.Supplier)
            .Include(p => p.Items)
            .AsQueryable();

        if (request.SupplierId.HasValue)
            query = query.Where(p => p.SupplierId == request.SupplierId.Value);

        var orders = await query
            .OrderByDescending(p => p.OrderDate)
            .ToListAsync(cancellationToken);

        return orders.Select(p => new PurchaseOrderListItemDto(
            p.Id,
            p.SupplierId,
            p.Supplier.Name,
            p.OrderDate,
            p.TotalAmount,
            p.Items.Count,
            p.CreatedAt
        )).ToList();
    }
}
