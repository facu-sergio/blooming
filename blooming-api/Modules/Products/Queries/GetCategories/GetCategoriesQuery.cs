using blooming_api.Modules.Products.DTOs.Categories;
using MediatR;

namespace blooming_api.Modules.Products.Queries.GetCategories;

public record GetCategoriesQuery(
    int Page = 1,
    int PageSize = 1000
) : IRequest<PagedCategoriesResult>;

public record PagedCategoriesResult(
    List<CategoryResponse> Items,
    int TotalCount,
    int Page,
    int PageSize
);
