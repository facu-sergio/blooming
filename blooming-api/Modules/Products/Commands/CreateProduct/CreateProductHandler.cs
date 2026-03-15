using blooming_api.Common;
using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Cloudinary;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Products.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

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
        var category = await _db.Categories.FindAsync([request.CategoryId], cancellationToken)
            ?? throw new NotFoundException($"Categoría {request.CategoryId} no encontrada");

        string? imageUrl = null;
        if (request.Image != null)
        {
            using var stream = request.Image.OpenReadStream();
            imageUrl = await _cloudinary.UploadImageAsync(stream, request.Image.FileName);
        }

        var product = new Product
        {
            Name = request.Name,
            CategoryId = request.CategoryId,
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
                CreatedAt = DateTime.UtcNow,
                Measurements = (v.Measurements ?? []).Select(m => new ProductVariantMeasurement
                {
                    MeasurementName = m.Name,
                    ValueInCm = m.ValueInCm,
                    CreatedAt = DateTime.UtcNow
                }).ToList()
            }).ToList()
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync(cancellationToken);

        return MapToResponse(product, category.Name);
    }

    internal static ProductResponse MapToResponse(Product product, string categoryName) => new()
    {
        Id = product.Id,
        Name = product.Name,
        CategoryId = product.CategoryId,
        CategoryName = categoryName,
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
            Stock = v.Stock,
            Measurements = v.Measurements.Select(m => new MeasurementResponse
            {
                Name = m.MeasurementName,
                ValueInCm = m.ValueInCm
            }).ToList()
        }).ToList()
    };
}
