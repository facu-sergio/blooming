using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Products.Commands.CreateProduct;
using blooming_api.Modules.Products.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Products.Queries.GetProductDetail;

public class GetProductDetailHandler : IRequestHandler<GetProductDetailQuery, ProductResponse>
{
    private readonly AppDbContext _db;

    public GetProductDetailHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ProductResponse> Handle(GetProductDetailQuery request, CancellationToken cancellationToken)
    {
        var product = await _db.Products
            .Include(p => p.Variants).ThenInclude(v => v.Size)
            .Include(p => p.Variants).ThenInclude(v => v.Color)
            .Include(p => p.Variants).ThenInclude(v => v.Measurements)
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken)
            ?? throw new NotFoundException($"Producto {request.ProductId} no encontrado");

        return CreateProductHandler.MapToResponse(product, product.Category.Name);
    }
}
