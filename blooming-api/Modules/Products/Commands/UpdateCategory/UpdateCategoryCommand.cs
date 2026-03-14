using blooming_api.Modules.Products.DTOs.Categories;
using MediatR;

namespace blooming_api.Modules.Products.Commands.UpdateCategory;

public record UpdateCategoryCommand(int CategoryId, string Name, string? Description) : IRequest<CategoryResponse>;
