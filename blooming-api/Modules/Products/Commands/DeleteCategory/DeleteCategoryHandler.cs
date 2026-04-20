using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Products.Commands.DeleteCategory;

public class DeleteCategoryHandler : IRequestHandler<DeleteCategoryCommand>
{
    private readonly AppDbContext _db;

    public DeleteCategoryHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _db.Categories.FindAsync([request.CategoryId], cancellationToken)
            ?? throw new NotFoundException($"Categoría {request.CategoryId} no encontrada");

        var hasProducts = await _db.Products
            .AnyAsync(p => p.CategoryId == request.CategoryId, cancellationToken);
        if (hasProducts)
            throw new BusinessRuleException("No se puede eliminar una categoría con productos asociados");

        _db.Categories.Remove(category);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
