using blooming_api.Modules.Products.DTOs;
using MediatR;

namespace blooming_api.Modules.Products.Commands.UpdateProduct;

public record UpdateProductCommand(
    int ProductId,
    string Name,
    int CategoryId,
    IFormFile? Image,
    bool RemoveImage,
    List<UpdateVariantDto> Variants,
    List<IFormFile?>? VariantImages = null
) : IRequest<ProductResponse>;
