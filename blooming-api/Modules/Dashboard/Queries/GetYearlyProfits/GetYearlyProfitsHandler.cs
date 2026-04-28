using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Orders.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Dashboard.Queries.GetYearlyProfits;

public class GetYearlyProfitsHandler : IRequestHandler<GetYearlyProfitsQuery, YearlyProfitsDto>
{
    private readonly AppDbContext _db;

    public GetYearlyProfitsHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<YearlyProfitsDto> Handle(GetYearlyProfitsQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var startOfYear = new DateTime(now.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var startOfNextYear = new DateTime(now.Year + 1, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        var deliveredOrders = await _db.Orders
            .Where(o => o.Status == OrderStatus.Delivered
                && o.DeliveredAt >= startOfYear
                && o.DeliveredAt < startOfNextYear)
            .Include(o => o.Items)
            .ToListAsync(cancellationToken);

        var orderCount = deliveredOrders.Count;
        var totalProfit = deliveredOrders
            .SelectMany(o => o.Items)
            .Sum(i => (i.UnitPrice - i.CostPriceAtSale) * i.Quantity);

        return new YearlyProfitsDto(orderCount, totalProfit);
    }
}
