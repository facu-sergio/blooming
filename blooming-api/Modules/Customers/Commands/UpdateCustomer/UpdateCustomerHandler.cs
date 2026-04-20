using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Customers.Commands.CreateCustomer;
using blooming_api.Modules.Customers.DTOs;
using MediatR;

namespace blooming_api.Modules.Customers.Commands.UpdateCustomer;

public class UpdateCustomerHandler : IRequestHandler<UpdateCustomerCommand, CustomerResponse>
{
    private readonly AppDbContext _db;

    public UpdateCustomerHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<CustomerResponse> Handle(UpdateCustomerCommand request, CancellationToken cancellationToken)
    {
        var customer = await _db.Customers.FindAsync([request.CustomerId], cancellationToken)
            ?? throw new NotFoundException($"Cliente {request.CustomerId} no encontrado");

        customer.Name = request.Name;
        customer.Phone = request.Phone;
        customer.Address = request.Address;
        customer.Notes = request.Notes;
        customer.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        return CreateCustomerHandler.MapToResponse(customer);
    }
}
