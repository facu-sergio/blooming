using blooming_api.Modules.Customers.DTOs;
using MediatR;

namespace blooming_api.Modules.Customers.Commands.UpdateCustomer;

public record UpdateCustomerCommand(int CustomerId, string Name, string Phone, string? Address, string? Notes) : IRequest<CustomerResponse>;
