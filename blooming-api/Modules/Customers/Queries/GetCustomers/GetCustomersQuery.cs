using blooming_api.Modules.Customers.DTOs;
using MediatR;

namespace blooming_api.Modules.Customers.Queries.GetCustomers;

public record GetCustomersQuery(
    string? SearchTerm = null,
    int Page = 1,
    int PageSize = 1000
) : IRequest<PagedCustomersResult>;

public record PagedCustomersResult(
    List<CustomerResponse> Items,
    int TotalCount,
    int Page,
    int PageSize
);
