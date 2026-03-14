using blooming_api.Modules.Products.DTOs;
using MediatR;

namespace blooming_api.Modules.Products.Commands.CreateProduct;

public record CreateProductCommand(
    string Name,
    int CategoryId,
    IFormFile? Image,
    List<CreateVariantDto> Variants
) : IRequest<ProductResponse>;
