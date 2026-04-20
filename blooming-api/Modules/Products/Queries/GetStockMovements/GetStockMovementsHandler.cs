using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Products.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Products.Queries.GetStockMovements;

public class GetStockMovementsHandler : IRequestHandler<GetStockMovementsQuery, StockMovementListResponse>
{
    private readonly AppDbContext _db;

    public GetStockMovementsHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<StockMovementListResponse> Handle(GetStockMovementsQuery request, CancellationToken cancellationToken)
    {
        var variantExists = await _db.ProductVariants
            .AnyAsync(v => v.Id == request.ProductVariantId, cancellationToken);

        if (!variantExists)
            throw new NotFoundException($"Variante {request.ProductVariantId} no encontrada.");

        var query = _db.StockMovements
            .Where(m => m.ProductVariantId == request.ProductVariantId)
            .OrderByDescending(m => m.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(m => new StockMovementResponse
            {
                Id = m.Id,
                MovementType = m.MovementType.ToString(),
                Quantity = m.Quantity,
                OrderId = m.OrderId,
                PurchaseOrderId = m.PurchaseOrderId,
                CreatedAt = m.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new StockMovementListResponse
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }
}
