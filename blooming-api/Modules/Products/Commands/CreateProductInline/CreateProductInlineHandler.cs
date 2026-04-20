using blooming_api.Common;
using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Products.Commands.CreateProduct;
using blooming_api.Modules.Products.DTOs;
using MediatR;

namespace blooming_api.Modules.Products.Commands.CreateProductInline;

public class CreateProductInlineHandler : IRequestHandler<CreateProductInlineCommand, ProductResponse>
{
    private readonly AppDbContext _db;

    public CreateProductInlineHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ProductResponse> Handle(CreateProductInlineCommand request, CancellationToken cancellationToken)
    {
        var category = await _db.Categories.FindAsync([request.CategoryId], cancellationToken)
            ?? throw new NotFoundException($"Categoría {request.CategoryId} no encontrada");

        var now = DateTime.UtcNow;

        var product = new Product
        {
            Name = request.Name,
            CategoryId = request.CategoryId,
            CreatedAt = now,
            Variants = new List<ProductVariant>
            {
                new()
                {
                    Size = request.Size,
                    Color = request.Color,
                    CostPrice = 0,
                    MarkupPercentage = request.MarkupPercentage,
                    SellingPrice = 0,
                    Stock = 0,
                    LowStockThreshold = request.LowStockThreshold,
                    CreatedAt = now
                }
            }
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync(cancellationToken);

        return CreateProductHandler.MapToResponse(product, category.Name);
    }
}
