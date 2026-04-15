using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Orders.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Dashboard.Queries.GetDailySalesMetrics;

public class GetDailySalesMetricsHandler : IRequestHandler<GetDailySalesMetricsQuery, DailySalesMetricsDto>
{
    private readonly AppDbContext _db;

    public GetDailySalesMetricsHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<DailySalesMetricsDto> Handle(GetDailySalesMetricsQuery request, CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var result = await _db.Orders
            .Where(o => o.Status == OrderStatus.Delivered
                && o.DeliveredAt >= today
                && o.DeliveredAt < tomorrow)
            .GroupBy(_ => 1)
            .Select(g => new { OrderCount = g.Count(), TotalAmount = g.Sum(o => o.Total) })
            .FirstOrDefaultAsync(cancellationToken);

        return result is null
            ? new DailySalesMetricsDto(0, 0)
            : new DailySalesMetricsDto(result.OrderCount, result.TotalAmount);
    }
}
