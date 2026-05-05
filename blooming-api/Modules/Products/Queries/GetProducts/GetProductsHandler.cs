using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Products.Commands.CreateProduct;
using blooming_api.Modules.Products.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Products.Queries.GetProducts;

public class GetProductsHandler : IRequestHandler<GetProductsQuery, PagedProductsResult>
{
    private readonly AppDbContext _db;

    public GetProductsHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedProductsResult> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.Products
            .Include(p => p.Variants).ThenInclude(v => v.Size)
            .Include(p => p.Variants).ThenInclude(v => v.Color)
            .Include(p => p.Variants).ThenInclude(v => v.Measurements)
            .Include(p => p.Category)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(term) ||
                p.Variants.Any(v =>
                    v.Color.Name.ToLower().Contains(term) ||
                    v.Size.Name.ToLower().Contains(term)));
        }

        if (!string.IsNullOrWhiteSpace(request.Category))
            query = query.Where(p => p.Category.Name == request.Category);

        if (request.SizeId.HasValue)
            query = query.Where(p => p.Variants.Any(v => v.SizeId == request.SizeId.Value));

        if (request.ColorId.HasValue)
            query = query.Where(p => p.Variants.Any(v => v.ColorId == request.ColorId.Value));

        var totalCount = await query.CountAsync(cancellationToken);

        var products = await query
            .OrderBy(p => p.Name)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedProductsResult(
            products.Select(p => CreateProductHandler.MapToResponse(p, p.Category.Name)).ToList(),
            totalCount,
            request.Page,
            request.PageSize
        );
    }
}
