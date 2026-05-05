using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Products.Commands.CreateColor;
using blooming_api.Modules.Products.DTOs;
using MediatR;

namespace blooming_api.Modules.Products.Commands.ToggleColorActive;

public class ToggleColorActiveHandler : IRequestHandler<ToggleColorActiveCommand, ColorAdminResponse>
{
    private readonly AppDbContext _db;

    public ToggleColorActiveHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ColorAdminResponse> Handle(ToggleColorActiveCommand request, CancellationToken cancellationToken)
    {
        var color = await _db.Colors.FindAsync([request.ColorId], cancellationToken)
            ?? throw new NotFoundException($"Color {request.ColorId} no encontrado");

        color.IsActive = !color.IsActive;
        await _db.SaveChangesAsync(cancellationToken);

        return CreateColorHandler.MapToAdminResponse(color);
    }
}
