using blooming_api.Modules.Customers.DTOs;
using MediatR;

namespace blooming_api.Modules.Customers.Commands.CreateCustomer;

public record CreateCustomerCommand(string Name, string Phone, string? Address, string? Notes) : IRequest<CustomerResponse>;
