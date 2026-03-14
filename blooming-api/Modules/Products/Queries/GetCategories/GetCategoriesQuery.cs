using blooming_api.Modules.Products.DTOs.Categories;
using MediatR;

namespace blooming_api.Modules.Products.Queries.GetCategories;

public record GetCategoriesQuery : IRequest<List<CategoryResponse>>;
