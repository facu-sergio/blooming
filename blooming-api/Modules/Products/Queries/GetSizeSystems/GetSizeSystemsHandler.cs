using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Products.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Products.Queries.GetSizeSystems;

public class GetSizeSystemsHandler : IRequestHandler<GetSizeSystemsQuery, List<SizeSystemResponse>>
{
    private readonly AppDbContext _db;

    public GetSizeSystemsHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<SizeSystemResponse>> Handle(GetSizeSystemsQuery request, CancellationToken cancellationToken)
    {
        return await _db.SizeSystems
            .Include(ss => ss.Sizes)
            .Where(ss => ss.IsActive)
            .OrderBy(ss => ss.SortOrder)
            .Select(ss => new SizeSystemResponse
            {
                Id = ss.Id,
                Name = ss.Name,
                DisplayName = ss.DisplayName,
                Sizes = ss.Sizes
                    .Where(s => s.IsActive)
                    .OrderBy(s => s.SortOrder)
                    .Select(s => new SizeResponse
                    {
                        Id = s.Id,
                        Name = s.Name,
                        DisplayName = s.DisplayName,
                        SortOrder = s.SortOrder,
                        Description = s.Description
                    })
                    .ToList()
            })
            .ToListAsync(cancellationToken);
    }
}
