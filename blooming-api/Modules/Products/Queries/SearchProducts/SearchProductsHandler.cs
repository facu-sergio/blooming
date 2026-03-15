using blooming_api.Common;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Products.Commands.CreateProduct;
using blooming_api.Modules.Products.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Products.Queries.SearchProducts;

public class SearchProductsHandler : IRequestHandler<SearchProductsQuery, List<ProductResponse>>
{
    private readonly AppDbContext _db;

    public SearchProductsHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<ProductResponse>> Handle(SearchProductsQuery query, CancellationToken cancellationToken)
    {
        var request = query.Request;

        IQueryable<Product> q = _db.Products
            .Include(p => p.Variants)
            .Include(p => p.Category)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.ToLower();
            q = q.Where(p => p.Name.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(request.Category))
        {
            var cat = request.Category.ToLower();
            q = q.Where(p => p.Category.Name.ToLower() == cat);
        }

        if (!string.IsNullOrWhiteSpace(request.Size))
        {
            var size = request.Size;
            q = q.Where(p => p.Variants.Any(v => v.Size == size));
        }

        if (!string.IsNullOrWhiteSpace(request.Color))
        {
            var color = request.Color;
            q = q.Where(p => p.Variants.Any(v => v.Color == color));
        }

        var products = await q.OrderBy(p => p.Name).ToListAsync(cancellationToken);

        return products.Select(p => CreateProductHandler.MapToResponse(p, p.Category.Name)).ToList();
    }
}
