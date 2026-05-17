using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Orders.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Dashboard.Queries.GetFondoReposicion;

public class GetFondoReposicionHandler : IRequestHandler<GetFondoReposicionQuery, FondoReposicionDto>
{
    private readonly AppDbContext _db;

    public GetFondoReposicionHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<FondoReposicionDto> Handle(GetFondoReposicionQuery request, CancellationToken cancellationToken)
    {
        var maxOcDate = await _db.PurchaseOrders
            .MaxAsync(o => (DateTime?)o.OrderDate, cancellationToken);

        if (!maxOcDate.HasValue)
            return new FondoReposicionDto(0m, 0m);

        var fondoCalculado = await _db.OrderItems
            .Where(i =>
                i.Order.CreatedAt >= maxOcDate.Value &&
                i.Order.Status != OrderStatus.Cancelled &&
                i.Order.Status != OrderStatus.Pending)
            .SumAsync(i => (decimal?)(i.CostPriceAtSale * i.Quantity), cancellationToken) ?? 0m;

        var config = await _db.ConfiguracionNegocio
            .FirstOrDefaultAsync(cancellationToken);

        var saldoFondo = config?.SaldoFondo ?? 0m;

        return new FondoReposicionDto(fondoCalculado, saldoFondo);
    }
}
