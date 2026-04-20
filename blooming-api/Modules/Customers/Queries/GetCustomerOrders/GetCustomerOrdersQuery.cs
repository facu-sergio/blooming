using MediatR;

namespace blooming_api.Modules.Customers.Queries.GetCustomerOrders;

public record GetCustomerOrdersQuery(int CustomerId) : IRequest<GetCustomerOrdersResult>;
