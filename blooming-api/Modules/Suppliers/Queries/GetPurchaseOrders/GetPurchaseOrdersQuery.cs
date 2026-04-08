using MediatR;

namespace blooming_api.Modules.Suppliers.Queries.GetPurchaseOrders;

public record GetPurchaseOrdersQuery(Guid? SupplierId) : IRequest<List<PurchaseOrderListItemDto>>;

public record PurchaseOrderListItemDto(
    int Id,
    Guid SupplierId,
    string SupplierName,
    DateTime OrderDate,
    decimal TotalAmount,
    int ItemCount,
    DateTime CreatedAt
);
