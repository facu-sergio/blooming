using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Orders.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Dashboard.Queries.GetMonthlyProfits;

public class GetMonthlyProfitsHandler : IRequestHandler<GetMonthlyProfitsQuery, MonthlyProfitsDto>
{
    private readonly AppDbContext _db;

    public GetMonthlyProfitsHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<MonthlyProfitsDto> Handle(GetMonthlyProfitsQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var startOfNextMonth = startOfMonth.AddMonths(1);

        var deliveredOrders = await _db.Orders
            .Where(o => o.Status == OrderStatus.Delivered
                && o.DeliveredAt >= startOfMonth
                && o.DeliveredAt < startOfNextMonth)
            .Include(o => o.Items)
                .ThenInclude(i => i.ProductVariant)
            .ToListAsync(cancellationToken);

        var orderCount = deliveredOrders.Count;
        var totalProfit = deliveredOrders
            .SelectMany(o => o.Items)
            .Sum(i => (i.UnitPrice - i.ProductVariant.CostPrice) * i.Quantity);

        return new MonthlyProfitsDto(orderCount, totalProfit);
    }
}
