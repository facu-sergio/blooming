using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Products.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Products.Queries.GetColorsAdmin;

public class GetColorsAdminHandler : IRequestHandler<GetColorsAdminQuery, List<ColorAdminResponse>>
{
    private readonly AppDbContext _db;

    public GetColorsAdminHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<ColorAdminResponse>> Handle(GetColorsAdminQuery request, CancellationToken cancellationToken)
    {
        return await _db.Colors
            .OrderBy(c => c.SortOrder)
            .Select(c => new ColorAdminResponse
            {
                Id = c.Id,
                Name = c.Name,
                DisplayName = c.DisplayName,
                SortOrder = c.SortOrder,
                IsActive = c.IsActive
            })
            .ToListAsync(cancellationToken);
    }
}
