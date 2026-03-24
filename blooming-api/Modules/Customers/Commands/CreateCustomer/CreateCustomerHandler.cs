using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Customers.DTOs;
using blooming_api.Modules.Customers.Entities;
using MediatR;

namespace blooming_api.Modules.Customers.Commands.CreateCustomer;

public class CreateCustomerHandler : IRequestHandler<CreateCustomerCommand, CustomerResponse>
{
    private readonly AppDbContext _db;

    public CreateCustomerHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<CustomerResponse> Handle(CreateCustomerCommand request, CancellationToken cancellationToken)
    {
        var customer = new Customer
        {
            Name = request.Name,
            Phone = request.Phone,
            Address = request.Address,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow
        };

        _db.Customers.Add(customer);
        await _db.SaveChangesAsync(cancellationToken);

        return MapToResponse(customer);
    }

    internal static CustomerResponse MapToResponse(Customer customer) => new()
    {
        Id = customer.Id,
        Name = customer.Name,
        Phone = customer.Phone,
        Address = customer.Address,
        Notes = customer.Notes,
        CreatedAt = customer.CreatedAt,
        UpdatedAt = customer.UpdatedAt
    };
}
