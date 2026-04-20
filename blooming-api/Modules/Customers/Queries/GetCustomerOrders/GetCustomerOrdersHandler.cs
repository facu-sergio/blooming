using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Orders.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Customers.Queries.GetCustomerOrders;

public class GetCustomerOrdersHandler : IRequestHandler<GetCustomerOrdersQuery, GetCustomerOrdersResult>
{
    private readonly AppDbContext _db;

    public GetCustomerOrdersHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<GetCustomerOrdersResult> Handle(
        GetCustomerOrdersQuery request,
        CancellationToken cancellationToken)
    {
        var customerExists = await _db.Customers
            .AnyAsync(c => c.Id == request.CustomerId, cancellationToken);

        if (!customerExists)
            throw new NotFoundException($"Cliente con id {request.CustomerId} no encontrado.");

        var orders = await _db.Orders
            .Where(o => o.CustomerId == request.CustomerId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new CustomerOrderSummary
            {
                Id = o.Id,
                CreatedAt = o.CreatedAt,
                Status = MapStatus(o.Status),
                Total = o.Total
            })
            .ToListAsync(cancellationToken);

        return new GetCustomerOrdersResult { Orders = orders };
    }

    /// <summary>
    /// Mapea el enum OrderStatus a nombre en español para la UI.
    ///
    /// [Historia 3.3] Traducción mínima para mostrar estado en historial.
    /// Epic 4: revisar si conviene centralizar en OrdersConstants o en el frontend.
    /// </summary>
    internal static string MapStatus(OrderStatus status) => status switch
    {
        OrderStatus.Pending => "Pendiente",
        OrderStatus.Confirmed => "Confirmado",
        OrderStatus.Shipped => "Enviado",
        OrderStatus.Delivered => "Entregado",
        OrderStatus.Cancelled => "Cancelado",
        _ => status.ToString()
    };
}
