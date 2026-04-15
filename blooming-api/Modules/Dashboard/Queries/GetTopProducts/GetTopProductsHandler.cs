using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Orders.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Dashboard.Queries.GetTopProducts;

public class GetTopProductsHandler : IRequestHandler<GetTopProductsQuery, List<TopProductDto>>
{
    private readonly AppDbContext _db;

    public GetTopProductsHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<TopProductDto>> Handle(GetTopProductsQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var startOfNextMonth = startOfMonth.AddMonths(1);

        var result = await _db.OrderItems
            .Include(i => i.Order)
            .Include(i => i.ProductVariant)
                .ThenInclude(v => v.Product)
            .Where(i => i.Order.Status == OrderStatus.Delivered
                && i.Order.DeliveredAt >= startOfMonth
                && i.Order.DeliveredAt < startOfNextMonth)
            .GroupBy(i => new { i.ProductVariant.ProductId, i.ProductVariant.Product.Name, i.ProductVariant.Product.ImageUrl })
            .Select(g => new
            {
                g.Key.ProductId,
                g.Key.Name,
                g.Key.ImageUrl,
                UnitsSold = g.Sum(i => i.Quantity)
            })
            .OrderByDescending(x => x.UnitsSold)
            .Take(5)
            .ToListAsync(cancellationToken);

        return result.Select(x => new TopProductDto(x.Name, x.ImageUrl, x.UnitsSold)).ToList();
    }
}
