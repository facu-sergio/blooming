using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Products.Commands.CreateColor;
using blooming_api.Modules.Products.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Products.Commands.UpdateColor;

public class UpdateColorHandler : IRequestHandler<UpdateColorCommand, ColorAdminResponse>
{
    private readonly AppDbContext _db;

    public UpdateColorHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ColorAdminResponse> Handle(UpdateColorCommand request, CancellationToken cancellationToken)
    {
        var color = await _db.Colors.FindAsync([request.ColorId], cancellationToken)
            ?? throw new NotFoundException($"Color {request.ColorId} no encontrado");

        if (request.Name != null)
        {
            var normalizedName = request.Name.ToUpperInvariant();

            if (normalizedName != color.Name)
            {
                var isReferenced = await _db.ProductVariants
                    .AnyAsync(v => v.ColorId == request.ColorId, cancellationToken);
                if (isReferenced)
                    throw new BusinessRuleException("No se puede cambiar el nombre de un color que está siendo usado en variantes de productos");

                var nameExists = await _db.Colors
                    .AnyAsync(c => c.Name == normalizedName && c.Id != request.ColorId, cancellationToken);
                if (nameExists)
                    throw new BusinessRuleException($"Ya existe un color con el nombre '{normalizedName}'");

                color.Name = normalizedName;
            }
        }

        if (request.DisplayName != null)
            color.DisplayName = request.DisplayName;

        if (request.SortOrder.HasValue)
            color.SortOrder = request.SortOrder.Value;

        await _db.SaveChangesAsync(cancellationToken);

        return CreateColorHandler.MapToAdminResponse(color);
    }
}
