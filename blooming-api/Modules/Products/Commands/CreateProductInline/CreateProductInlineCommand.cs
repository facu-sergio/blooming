using blooming_api.Modules.Products.DTOs;
using MediatR;

namespace blooming_api.Modules.Products.Commands.CreateProductInline;

public record CreateProductInlineCommand(
    string Name,
    int CategoryId,
    int SizeId,
    int ColorId,
    decimal MarkupPercentage,
    int? LowStockThreshold
) : IRequest<ProductResponse>;
