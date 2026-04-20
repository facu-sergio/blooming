using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Suppliers.Commands.CreateSupplier;
using blooming_api.Modules.Suppliers.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Suppliers.Queries.GetSuppliers;

public class GetSuppliersHandler : IRequestHandler<GetSuppliersQuery, PagedSuppliersResult>
{
    private readonly AppDbContext _db;

    public GetSuppliersHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedSuppliersResult> Handle(GetSuppliersQuery request, CancellationToken cancellationToken)
    {
        var query = _db.Suppliers.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.ToLower();
            query = query.Where(s =>
                s.Name.ToLower().Contains(term) ||
                (s.Phone != null && s.Phone.ToLower().Contains(term)) ||
                (s.Website != null && s.Website.ToLower().Contains(term)) ||
                (s.Address != null && s.Address.ToLower().Contains(term)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var suppliers = await query
            .OrderBy(s => s.Name)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedSuppliersResult(
            suppliers.Select(CreateSupplierHandler.MapToResponse).ToList(),
            totalCount,
            request.Page,
            request.PageSize
        );
    }
}
