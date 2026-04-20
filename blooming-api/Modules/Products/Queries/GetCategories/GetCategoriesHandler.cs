using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Products.Commands.CreateCategory;
using blooming_api.Modules.Products.DTOs.Categories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Products.Queries.GetCategories;

public class GetCategoriesHandler : IRequestHandler<GetCategoriesQuery, PagedCategoriesResult>
{
    private readonly AppDbContext _db;

    public GetCategoriesHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedCategoriesResult> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
    {
        var query = _db.Categories.AsQueryable();

        var totalCount = await query.CountAsync(cancellationToken);

        var categories = await query
            .OrderBy(c => c.Name)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedCategoriesResult(
            categories.Select(CreateCategoryHandler.MapToResponse).ToList(),
            totalCount,
            request.Page,
            request.PageSize
        );
    }
}
