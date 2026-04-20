using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Products.Commands.CreateCategory;
using blooming_api.Modules.Products.DTOs.Categories;
using MediatR;

namespace blooming_api.Modules.Products.Queries.GetCategoryDetail;

public class GetCategoryDetailHandler : IRequestHandler<GetCategoryDetailQuery, CategoryResponse>
{
    private readonly AppDbContext _db;

    public GetCategoryDetailHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<CategoryResponse> Handle(GetCategoryDetailQuery request, CancellationToken cancellationToken)
    {
        var category = await _db.Categories.FindAsync([request.CategoryId], cancellationToken)
            ?? throw new NotFoundException($"Categoría {request.CategoryId} no encontrada");

        return CreateCategoryHandler.MapToResponse(category);
    }
}
