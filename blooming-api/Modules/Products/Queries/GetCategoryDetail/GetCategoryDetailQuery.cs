using blooming_api.Modules.Products.DTOs.Categories;
using MediatR;

namespace blooming_api.Modules.Products.Queries.GetCategoryDetail;

public record GetCategoryDetailQuery(int CategoryId) : IRequest<CategoryResponse>;
