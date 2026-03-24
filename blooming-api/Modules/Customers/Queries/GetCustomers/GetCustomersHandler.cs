using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Customers.Commands.CreateCustomer;
using blooming_api.Modules.Customers.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Customers.Queries.GetCustomers;

public class GetCustomersHandler : IRequestHandler<GetCustomersQuery, List<CustomerResponse>>
{
    private readonly AppDbContext _db;

    public GetCustomersHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<CustomerResponse>> Handle(GetCustomersQuery request, CancellationToken cancellationToken)
    {
        var customers = await _db.Customers
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);

        return customers.Select(CreateCustomerHandler.MapToResponse).ToList();
    }
}
