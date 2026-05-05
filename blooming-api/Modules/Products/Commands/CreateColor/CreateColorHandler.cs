using System.Globalization;
using blooming_api.Common;
using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Products.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Products.Commands.CreateColor;

public class CreateColorHandler : IRequestHandler<CreateColorCommand, ColorAdminResponse>
{
    private readonly AppDbContext _db;

    public CreateColorHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ColorAdminResponse> Handle(CreateColorCommand request, CancellationToken cancellationToken)
    {
        var normalizedName = request.Name.ToUpperInvariant();

        var nameExists = await _db.Colors
            .AnyAsync(c => c.Name == normalizedName, cancellationToken);
        if (nameExists)
            throw new BusinessRuleException($"Ya existe un color con el nombre '{normalizedName}'");

        var displayName = request.DisplayName
            ?? CultureInfo.InvariantCulture.TextInfo.ToTitleCase(request.Name.ToLowerInvariant());

        var color = new Color
        {
            Name = normalizedName,
            DisplayName = displayName,
            SortOrder = request.SortOrder,
            IsActive = true
        };

        _db.Colors.Add(color);
        await _db.SaveChangesAsync(cancellationToken);

        return MapToAdminResponse(color);
    }

    internal static ColorAdminResponse MapToAdminResponse(Color color) => new()
    {
        Id = color.Id,
        Name = color.Name,
        DisplayName = color.DisplayName,
        SortOrder = color.SortOrder,
        IsActive = color.IsActive
    };
}
