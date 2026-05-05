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

        var sizeIds = request.Variants.Select(v => v.SizeId).Distinct().ToList();
        var colorIds = request.Variants.Select(v => v.ColorId).Distinct().ToList();

        var sizes = await _db.Sizes
            .Where(s => sizeIds.Contains(s.Id))
            .ToDictionaryAsync(s => s.Id, cancellationToken);
        var colors = await _db.Colors
            .Where(c => colorIds.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id, cancellationToken);

        foreach (var sizeId in sizeIds)
            if (!sizes.ContainsKey(sizeId))
                throw new NotFoundException($"Talle {sizeId} no encontrado");
        foreach (var colorId in colorIds)
            if (!colors.ContainsKey(colorId))
                throw new NotFoundException($"Color {colorId} no encontrado");

        string? imageUrl = null;
        if (request.Image != null)
        {
            using var stream = request.Image.OpenReadStream();
            imageUrl = await _cloudinary.UploadImageAsync(stream, request.Image.FileName);
        }

        var variants = new List<ProductVariant>();
        for (var i = 0; i < request.Variants.Count; i++)
        {
            var v = request.Variants[i];
            string? variantImageUrl = null;
            var variantImageFile = request.VariantImages?.ElementAtOrDefault(i);
            if (variantImageFile != null)
            {
                using var variantStream = variantImageFile.OpenReadStream();
                variantImageUrl = await _cloudinary.UploadImageAsync(variantStream, variantImageFile.FileName);
            }

            variants.Add(new ProductVariant
            {
                SizeId = v.SizeId,
                Size = sizes[v.SizeId],
                ColorId = v.ColorId,
                Color = colors[v.ColorId],
                CostPrice = v.CostPrice,
                MarkupPercentage = v.MarkupPercentage,
                SellingPrice = v.CostPrice * (1 + v.MarkupPercentage / 100),
                Stock = 0,
                LowStockThreshold = v.LowStockThreshold,
                ImageUrl = variantImageUrl,
                Description = v.Description,
                CreatedAt = DateTime.UtcNow,
                Measurements = (v.Measurements ?? []).Select(m => new ProductVariantMeasurement
                {
                    MeasurementName = m.Name,
                    ValueInCm = m.ValueInCm,
                    CreatedAt = DateTime.UtcNow
                }).ToList()
            });
        }

        var product = new Product
        {
            Name = request.Name,
            CategoryId = request.CategoryId,
            ImageUrl = imageUrl,
            CreatedAt = DateTime.UtcNow,
            Variants = variants
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
        SizeSystemId = product.SizeSystemId,
        ImageUrl = product.ImageUrl,
        CreatedAt = product.CreatedAt,
        Variants = product.Variants.Select(v => new VariantResponse
        {
            Id = v.Id,
            SizeId = v.SizeId,
            SizeName = v.Size.DisplayName,
            SizeDescription = v.Size.Description,
            ColorId = v.ColorId,
            ColorName = v.Color.DisplayName,
            CostPrice = v.CostPrice,
            MarkupPercentage = v.MarkupPercentage,
            SellingPrice = v.SellingPrice,
            Stock = v.Stock,
            LowStockThreshold = v.LowStockThreshold,
            ImageUrl = v.ImageUrl,
            Description = v.Description,
            Measurements = v.Measurements.Select(m => new MeasurementResponse
            {
                Name = m.MeasurementName,
                ValueInCm = m.ValueInCm
            }).ToList()
        }).ToList()
    };
}
