using MediatR;

namespace blooming_api.Modules.Orders.Queries.GetOrders;

public record GetOrdersQuery(
    string? Status,
    DateTime? FromDate,
    DateTime? ToDate,
    int? CustomerId,
    int Page,
    int PageSize
) : IRequest<PagedOrdersResult>;

public record PagedOrdersResult(
    List<OrderListItemDto> Items,
    int TotalCount,
    int Page,
    int PageSize
);

public record OrderListItemDto(
    int Id,
    int CustomerId,
    string CustomerName,
    string Status,
    string StatusKey,
    decimal Total,
    DateTime CreatedAt
);
