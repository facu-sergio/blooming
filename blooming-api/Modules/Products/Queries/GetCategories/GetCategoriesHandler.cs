using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Products.Commands.CreateCategory;
using blooming_api.Modules.Products.DTOs.Categories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Products.Queries.GetCategories;

public class GetCategoriesHandler : IRequestHandler<GetCategoriesQuery, List<CategoryResponse>>
{
    private readonly AppDbContext _db;

    public GetCategoriesHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<CategoryResponse>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await _db.Categories
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);

        return categories.Select(CreateCategoryHandler.MapToResponse).ToList();
    }
}
