using blooming_api.Common;
using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Cloudinary;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Products.Commands.CreateProduct;
using blooming_api.Modules.Products.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Products.Commands.UpdateProduct;

public class UpdateProductHandler : IRequestHandler<UpdateProductCommand, ProductResponse>
{
    private readonly AppDbContext _db;
    private readonly ICloudinaryService _cloudinary;

    public UpdateProductHandler(AppDbContext db, ICloudinaryService cloudinary)
    {
        _db = db;
        _cloudinary = cloudinary;
    }

    public async Task<ProductResponse> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _db.Products
            .Include(p => p.Variants).ThenInclude(v => v.Size)
            .Include(p => p.Variants).ThenInclude(v => v.Color)
            .Include(p => p.Variants).ThenInclude(v => v.Measurements)
            .FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken)
            ?? throw new NotFoundException($"Producto {request.ProductId} no encontrado");

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

        if (request.Image != null)
        {
            if (product.ImageUrl != null)
                await DeleteCloudinaryImage(product.ImageUrl);
            using var stream = request.Image.OpenReadStream();
            product.ImageUrl = await _cloudinary.UploadImageAsync(stream, request.Image.FileName);
        }
        else if (request.RemoveImage && product.ImageUrl != null)
        {
            await DeleteCloudinaryImage(product.ImageUrl);
            product.ImageUrl = null;
        }

        product.Name = request.Name;
        product.CategoryId = request.CategoryId;
        product.UpdatedAt = DateTime.UtcNow;

        for (var idx = 0; idx < request.Variants.Count; idx++)
        {
            var variantDto = request.Variants[idx];
            var variantImageFile = request.VariantImages?.ElementAtOrDefault(idx);

            if (variantDto.Id.HasValue && variantDto.Id > 0)
            {
                var existing = product.Variants.FirstOrDefault(v => v.Id == variantDto.Id.Value);
                if (existing != null)
                {
                    existing.SizeId = variantDto.SizeId;
                    existing.Size = sizes[variantDto.SizeId];
                    existing.ColorId = variantDto.ColorId;
                    existing.Color = colors[variantDto.ColorId];
                    existing.CostPrice = variantDto.CostPrice;
                    existing.MarkupPercentage = variantDto.MarkupPercentage;
                    existing.SellingPrice = variantDto.CostPrice * (1 + variantDto.MarkupPercentage / 100);
                    existing.LowStockThreshold = variantDto.LowStockThreshold;
                    existing.Description = variantDto.Description;
                    existing.UpdatedAt = DateTime.UtcNow;

                    if (variantImageFile != null)
                    {
                        if (existing.ImageUrl != null)
                            await DeleteCloudinaryImage(existing.ImageUrl);
                        using var vs = variantImageFile.OpenReadStream();
                        existing.ImageUrl = await _cloudinary.UploadImageAsync(vs, variantImageFile.FileName);
                    }
                    else if (variantDto.RemoveVariantImage && existing.ImageUrl != null)
                    {
                        await DeleteCloudinaryImage(existing.ImageUrl);
                        existing.ImageUrl = null;
                    }

                    existing.Measurements.Clear();
                    foreach (var m in variantDto.Measurements ?? [])
                    {
                        existing.Measurements.Add(new ProductVariantMeasurement
                        {
                            MeasurementName = m.Name,
                            ValueInCm = m.ValueInCm,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }
            }
            else
            {
                string? variantImageUrl = null;
                if (variantImageFile != null)
                {
                    using var vs = variantImageFile.OpenReadStream();
                    variantImageUrl = await _cloudinary.UploadImageAsync(vs, variantImageFile.FileName);
                }

                product.Variants.Add(new ProductVariant
                {
                    SizeId = variantDto.SizeId,
                    Size = sizes[variantDto.SizeId],
                    ColorId = variantDto.ColorId,
                    Color = colors[variantDto.ColorId],
                    CostPrice = variantDto.CostPrice,
                    MarkupPercentage = variantDto.MarkupPercentage,
                    SellingPrice = variantDto.CostPrice * (1 + variantDto.MarkupPercentage / 100),
                    Stock = 0,
                    LowStockThreshold = variantDto.LowStockThreshold,
                    ImageUrl = variantImageUrl,
                    Description = variantDto.Description,
                    CreatedAt = DateTime.UtcNow,
                    Measurements = (variantDto.Measurements ?? []).Select(m => new ProductVariantMeasurement
                    {
                        MeasurementName = m.Name,
                        ValueInCm = m.ValueInCm,
                        CreatedAt = DateTime.UtcNow
                    }).ToList()
                });
            }
        }

        await _db.SaveChangesAsync(cancellationToken);

        return CreateProductHandler.MapToResponse(product, category.Name);
    }

    private async Task DeleteCloudinaryImage(string imageUrl)
    {
        var uri = new Uri(imageUrl);
        var segments = uri.AbsolutePath.Split('/');
        var uploadIndex = Array.IndexOf(segments, "upload");
        if (uploadIndex >= 0 && uploadIndex + 2 < segments.Length)
        {
            var startIndex = uploadIndex + 2;
            if (segments[uploadIndex + 1].StartsWith('v') && int.TryParse(segments[uploadIndex + 1][1..], out _))
                startIndex = uploadIndex + 2;
            else
                startIndex = uploadIndex + 1;

            var publicIdWithExt = string.Join("/", segments[startIndex..]);
            var publicId = publicIdWithExt[..publicIdWithExt.LastIndexOf('.')];
            await _cloudinary.DeleteImageAsync(publicId);
        }
    }
}
