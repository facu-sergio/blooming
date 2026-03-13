using blooming_api.Common;
using blooming_api.Infrastructure.Cloudinary;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Products.DTOs;
using MediatR;

namespace blooming_api.Modules.Products.Commands.CreateProduct;

public class CreateProductHandler : IRequestHandler<CreateProductCommand, ProductResponse>
{
    private readonly AppDbContext _db;
    private readonly ICloudinaryService _cloudinary;

    public CreateProductHandler(AppDbContext db, ICloudinaryService cloudinary)
    {
        _db = db;
        _cloudinary = cloudinary;
    }

    public async Task<ProductResponse> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        string? imageUrl = null;
        if (request.Image != null)
        {
            using var stream = request.Image.OpenReadStream();
            imageUrl = await _cloudinary.UploadImageAsync(stream, request.Image.FileName);
        }

        var product = new Product
        {
            Name = request.Name,
            Category = request.Category,
            ImageUrl = imageUrl,
            CreatedAt = DateTime.UtcNow,
            Variants = request.Variants.Select(v => new ProductVariant
            {
                Size = v.Size,
                Color = v.Color,
                CostPrice = v.CostPrice,
                MarkupPercentage = v.MarkupPercentage,
                SellingPrice = v.CostPrice * (1 + v.MarkupPercentage / 100),
                Stock = 0,
                CreatedAt = DateTime.UtcNow
            }).ToList()
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync(cancellationToken);

        return MapToResponse(product);
    }

    internal static ProductResponse MapToResponse(Product product) => new()
    {
        Id = product.Id,
        Name = product.Name,
        Category = product.Category,
        ImageUrl = product.ImageUrl,
        CreatedAt = product.CreatedAt,
        Variants = product.Variants.Select(v => new VariantResponse
        {
            Id = v.Id,
            Size = v.Size,
            Color = v.Color,
            CostPrice = v.CostPrice,
            MarkupPercentage = v.MarkupPercentage,
            SellingPrice = v.SellingPrice,
            Stock = v.Stock
        }).ToList()
    };
}
