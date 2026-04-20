using MediatR;

namespace blooming_api.Modules.Products.Commands.DeleteCategory;

public record DeleteCategoryCommand(int CategoryId) : IRequest;
