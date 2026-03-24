using blooming_api.Modules.Customers.DTOs;
using MediatR;

namespace blooming_api.Modules.Customers.Queries.GetCustomers;

public record GetCustomersQuery(string? SearchTerm = null) : IRequest<List<CustomerResponse>>;
