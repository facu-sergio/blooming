using blooming_api.Modules.Products.DTOs;
using MediatR;

namespace blooming_api.Modules.Products.Queries.GetStockMovements;

public record GetStockMovementsQuery(int ProductVariantId, int PageNumber = 1, int PageSize = 20)
    : IRequest<StockMovementListResponse>;
