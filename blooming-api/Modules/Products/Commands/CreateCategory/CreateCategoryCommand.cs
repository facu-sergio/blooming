using blooming_api.Modules.Products.DTOs.Categories;
using MediatR;

namespace blooming_api.Modules.Products.Commands.CreateCategory;

public record CreateCategoryCommand(string Name, string? Description) : IRequest<CategoryResponse>;
