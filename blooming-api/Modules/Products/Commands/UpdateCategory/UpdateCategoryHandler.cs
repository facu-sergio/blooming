using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Products.Commands.CreateCategory;
using blooming_api.Modules.Products.DTOs.Categories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Products.Commands.UpdateCategory;

public class UpdateCategoryHandler : IRequestHandler<UpdateCategoryCommand, CategoryResponse>
{
    private readonly AppDbContext _db;

    public UpdateCategoryHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<CategoryResponse> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _db.Categories.FindAsync([request.CategoryId], cancellationToken)
            ?? throw new NotFoundException($"Categoría {request.CategoryId} no encontrada");

        var nameExists = await _db.Categories
            .AnyAsync(c => c.Name == request.Name && c.Id != request.CategoryId, cancellationToken);
        if (nameExists)
            throw new BusinessRuleException($"Ya existe una categoría con el nombre '{request.Name}'");

        category.Name = request.Name;
        category.Description = request.Description;
        category.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        return CreateCategoryHandler.MapToResponse(category);
    }
}
