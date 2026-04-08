using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Suppliers.Commands.CreateSupplier;
using blooming_api.Modules.Suppliers.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Suppliers.Queries.GetSuppliers;

public class GetSuppliersHandler : IRequestHandler<GetSuppliersQuery, List<SupplierResponse>>
{
    private readonly AppDbContext _db;

    public GetSuppliersHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<SupplierResponse>> Handle(GetSuppliersQuery request, CancellationToken cancellationToken)
    {
        var query = _db.Suppliers.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.ToLower();
            query = query.Where(s =>
                s.Name.ToLower().Contains(term) ||
                (s.ContactInfo != null && s.ContactInfo.ToLower().Contains(term)));
        }

        var suppliers = await query
            .OrderBy(s => s.Name)
            .ToListAsync(cancellationToken);

        return suppliers.Select(CreateSupplierHandler.MapToResponse).ToList();
    }
}
