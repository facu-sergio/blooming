using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Products.Commands.CreateProduct;
using blooming_api.Modules.Products.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Products.Queries.GetProducts;

public class GetProductsHandler : IRequestHandler<GetProductsQuery, List<ProductResponse>>
{
    private readonly AppDbContext _db;

    public GetProductsHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<ProductResponse>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        var products = await _db.Products
            .Include(p => p.Variants)
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);

        return products.Select(CreateProductHandler.MapToResponse).ToList();
    }
}
