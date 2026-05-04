using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Products.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Products.Queries.GetColors;

public class GetColorsHandler : IRequestHandler<GetColorsQuery, List<ColorResponse>>
{
    private readonly AppDbContext _db;

    public GetColorsHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<ColorResponse>> Handle(GetColorsQuery request, CancellationToken cancellationToken)
    {
        return await _db.Colors
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder)
            .Select(c => new ColorResponse
            {
                Id = c.Id,
                Name = c.Name,
                DisplayName = c.DisplayName,
                SortOrder = c.SortOrder
            })
            .ToListAsync(cancellationToken);
    }
}
