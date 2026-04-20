using blooming_api.Modules.Products.DTOs;
using MediatR;

namespace blooming_api.Modules.Products.Queries.GetProducts;

public record GetProductsQuery(
    string? SearchTerm = null,
    string? Category = null,
    string? Size = null,
    string? Color = null,
    int Page = 1,
    int PageSize = 1000
) : IRequest<PagedProductsResult>;

public record PagedProductsResult(
    List<ProductResponse> Items,
    int TotalCount,
    int Page,
    int PageSize
);
