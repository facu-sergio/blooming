using MediatR;

namespace blooming_api.Modules.Suppliers.Queries.GetPurchaseOrders;

public record GetPurchaseOrdersQuery(
    Guid? SupplierId = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    int Page = 1,
    int PageSize = 1000
) : IRequest<PagedPurchaseOrdersResult>;

public record PagedPurchaseOrdersResult(
    List<PurchaseOrderListItemDto> Items,
    int TotalCount,
    int Page,
    int PageSize
);

public record PurchaseOrderListItemDto(
    int Id,
    Guid SupplierId,
    string SupplierName,
    DateTime OrderDate,
    decimal TotalAmount,
    int ItemCount,
    DateTime CreatedAt,
    List<PurchaseOrderItemSummaryDto> Items
);

public record PurchaseOrderItemSummaryDto(
    string ProductName,
    string? ImageUrl
);
