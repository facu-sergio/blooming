using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Orders.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using static blooming_api.Modules.Orders.Entities.OrderStatusTransitions;

namespace blooming_api.Modules.Orders.Queries.GetOrders;

public class GetOrdersHandler : IRequestHandler<GetOrdersQuery, PagedOrdersResult>
{
    private readonly AppDbContext _db;

    public GetOrdersHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedOrdersResult> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
    {
        var query = _db.Orders.Include(o => o.Customer).AsQueryable();

        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<OrderStatus>(request.Status, out var statusFilter))
            query = query.Where(o => o.Status == statusFilter);

        if (request.FromDate.HasValue)
            query = query.Where(o => o.CreatedAt >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(o => o.CreatedAt <= request.ToDate.Value);

        if (request.CustomerId.HasValue)
            query = query.Where(o => o.CustomerId == request.CustomerId.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(o => new OrderListItemDto(
                o.Id,
                o.CustomerId,
                o.Customer.Name,
                MapToSpanish(o.Status),
                o.Status.ToString(),
                o.Total,
                o.CreatedAt,
                o.DeliveredAt
            ))
            .ToListAsync(cancellationToken);

        return new PagedOrdersResult(orders, totalCount, request.Page, request.PageSize);
    }
}
