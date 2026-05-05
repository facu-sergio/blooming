using blooming_api.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Dashboard.Queries.GetActiveStockAlerts;

public class GetActiveStockAlertsHandler : IRequestHandler<GetActiveStockAlertsQuery, List<StockAlertDto>>
{
    private readonly AppDbContext _db;

    public GetActiveStockAlertsHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<StockAlertDto>> Handle(GetActiveStockAlertsQuery request, CancellationToken cancellationToken)
    {
        var alerts = await _db.ProductVariants
            .Include(v => v.Product)
            .Include(v => v.Size)
            .Include(v => v.Color)
            .Where(v => v.LowStockThreshold.HasValue && v.Stock < v.LowStockThreshold.Value)
            .OrderBy(v => v.Stock)
            .Select(v => new StockAlertDto(
                v.Product.Name,
                v.Size.DisplayName,
                v.Color.DisplayName,
                v.Stock,
                v.LowStockThreshold!.Value))
            .ToListAsync(cancellationToken);

        return alerts;
    }
}
