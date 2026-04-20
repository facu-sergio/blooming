using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Customers.Commands.CreateCustomer;
using blooming_api.Modules.Customers.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Customers.Queries.GetCustomers;

public class GetCustomersHandler : IRequestHandler<GetCustomersQuery, PagedCustomersResult>
{
    private readonly AppDbContext _db;

    public GetCustomersHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedCustomersResult> Handle(GetCustomersQuery request, CancellationToken cancellationToken)
    {
        var query = _db.Customers.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.ToLower();
            query = query.Where(c =>
                c.Name.ToLower().Contains(term) ||
                c.Phone.ToLower().Contains(term));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var customers = await query
            .OrderBy(c => c.Name)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedCustomersResult(
            customers.Select(CreateCustomerHandler.MapToResponse).ToList(),
            totalCount,
            request.Page,
            request.PageSize
        );
    }
}
