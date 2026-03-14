using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Products.DTOs.Categories;
using blooming_api.Modules.Products.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Products.Commands.CreateCategory;

public class CreateCategoryHandler : IRequestHandler<CreateCategoryCommand, CategoryResponse>
{
    private readonly AppDbContext _db;

    public CreateCategoryHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<CategoryResponse> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        var nameExists = await _db.Categories
            .AnyAsync(c => c.Name == request.Name, cancellationToken);
        if (nameExists)
            throw new BusinessRuleException($"Ya existe una categoría con el nombre '{request.Name}'");

        var category = new Category
        {
            Name = request.Name,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow
        };

        _db.Categories.Add(category);
        await _db.SaveChangesAsync(cancellationToken);

        return MapToResponse(category);
    }

    internal static CategoryResponse MapToResponse(Category category) => new()
    {
        Id = category.Id,
        Name = category.Name,
        Description = category.Description,
        CreatedAt = category.CreatedAt
    };
}
