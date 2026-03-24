using MediatR;

namespace blooming_api.Modules.Customers.Queries.GetCustomerMetrics;

public record GetCustomerMetricsQuery(int CustomerId) : IRequest<GetCustomerMetricsResult>;
