using blooming_api.Modules.Products.DTOs;
using MediatR;

namespace blooming_api.Modules.Products.Commands.CreateProductInline;

public record CreateProductInlineCommand(
    string Name,
    int CategoryId,
    string Size,
    string Color,
    decimal MarkupPercentage,
    int? LowStockThreshold
) : IRequest<ProductResponse>;
