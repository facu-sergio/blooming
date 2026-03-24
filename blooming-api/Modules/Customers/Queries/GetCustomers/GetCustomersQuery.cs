using blooming_api.Modules.Customers.DTOs;
using MediatR;

namespace blooming_api.Modules.Customers.Queries.GetCustomers;

public record GetCustomersQuery() : IRequest<List<CustomerResponse>>;
