using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Orders.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Customers.Queries.GetCustomerMetrics;

public class GetCustomerMetricsHandler : IRequestHandler<GetCustomerMetricsQuery, GetCustomerMetricsResult>
{
    private readonly AppDbContext _db;

    public GetCustomerMetricsHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<GetCustomerMetricsResult> Handle(
        GetCustomerMetricsQuery request,
        CancellationToken cancellationToken)
    {
        var customerExists = await _db.Customers
            .AnyAsync(c => c.Id == request.CustomerId, cancellationToken);

        if (!customerExists)
            throw new NotFoundException($"Cliente con id {request.CustomerId} no encontrado.");

        var orders = await _db.Orders
            .Where(o => o.CustomerId == request.CustomerId)
            .Select(o => new { o.Status, o.Total })
            .ToListAsync(cancellationToken);

        var totalOrders = orders.Count;

        // Excluye Cancelled del monto gastado — no generaron facturación efectiva.
        // Epic 4: revisar si aplica el mismo criterio al implementar reembolsos.
        var totalSpent = orders
            .Where(o => o.Status != OrderStatus.Cancelled)
            .Sum(o => o.Total);

        return new GetCustomerMetricsResult
        {
            TotalOrders = totalOrders,
            TotalSpent = totalSpent
        };
    }
}
