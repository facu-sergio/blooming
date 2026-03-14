using blooming_api.Modules.Products.DTOs;
using MediatR;

namespace blooming_api.Modules.Products.Commands.UpdateProduct;

public record UpdateProductCommand(
    int ProductId,
    string Name,
    int CategoryId,
    IFormFile? Image,
    bool RemoveImage,
    List<UpdateVariantDto> Variants
) : IRequest<ProductResponse>;
