using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Products.Queries.GetPriceHistory;

public class GetPriceHistoryHandler : IRequestHandler<GetPriceHistoryQuery, List<PriceHistoryItemDto>>
{
    private readonly AppDbContext _db;

    public GetPriceHistoryHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<PriceHistoryItemDto>> Handle(GetPriceHistoryQuery request, CancellationToken cancellationToken)
    {
        var variantExists = await _db.ProductVariants.AnyAsync(v => v.Id == request.ProductVariantId, cancellationToken);
        if (!variantExists)
            throw new NotFoundException($"Variante {request.ProductVariantId} no encontrada");

        return await _db.ProductVariantPriceHistories
            .Where(h => h.ProductVariantId == request.ProductVariantId)
            .OrderByDescending(h => h.CreatedAt)
            .Select(h => new PriceHistoryItemDto
            {
                Id = h.Id,
                CostPrice = h.CostPrice,
                SellingPrice = h.SellingPrice,
                MarkupPercentage = h.MarkupPercentage,
                PurchaseOrderId = h.PurchaseOrderId,
                CreatedAt = h.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }
}
