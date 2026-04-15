using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Orders.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Dashboard.Queries.GetMonthlyMargin;

public class GetMonthlyMarginHandler : IRequestHandler<GetMonthlyMarginQuery, MonthlyMarginDto>
{
    private readonly AppDbContext _db;

    public GetMonthlyMarginHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<MonthlyMarginDto> Handle(GetMonthlyMarginQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var startOfNextMonth = startOfMonth.AddMonths(1);

        var revenue = await _db.Orders
            .Where(o => o.Status == OrderStatus.Delivered
                && o.DeliveredAt >= startOfMonth
                && o.DeliveredAt < startOfNextMonth)
            .SumAsync(o => (decimal?)o.Total, cancellationToken) ?? 0m;

        var cost = await _db.PurchaseOrders
            .Where(p => p.OrderDate >= startOfMonth && p.OrderDate < startOfNextMonth)
            .SumAsync(p => (decimal?)p.TotalAmount, cancellationToken) ?? 0m;

        return new MonthlyMarginDto(revenue, cost, revenue - cost);
    }
}
