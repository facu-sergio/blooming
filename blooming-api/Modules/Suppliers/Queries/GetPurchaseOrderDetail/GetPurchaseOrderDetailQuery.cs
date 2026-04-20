using MediatR;

namespace blooming_api.Modules.Suppliers.Queries.GetPurchaseOrderDetail;

public record GetPurchaseOrderDetailQuery(int PurchaseOrderId) : IRequest<PurchaseOrderDetailDto>;

public record PurchaseOrderDetailDto(
    int Id,
    Guid SupplierId,
    string SupplierName,
    DateTime OrderDate,
    decimal TotalAmount,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    List<PurchaseOrderItemDetailDto> Items
);

public record PurchaseOrderItemDetailDto(
    int Id,
    int ProductVariantId,
    string ProductName,
    string VariantLabel,
    int Quantity,
    decimal UnitCostPrice,
    decimal LineTotal
);
