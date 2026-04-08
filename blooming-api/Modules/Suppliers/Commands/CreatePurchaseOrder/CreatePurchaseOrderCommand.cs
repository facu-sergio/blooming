using MediatR;

namespace blooming_api.Modules.Suppliers.Commands.CreatePurchaseOrder;

public record CreatePurchaseOrderItemDto(
    int ProductVariantId,
    int Quantity,
    decimal UnitCostPrice
);

public record CreatePurchaseOrderCommand(
    Guid SupplierId,
    List<CreatePurchaseOrderItemDto> Items,
    DateTime? OrderDate
) : IRequest<CreatePurchaseOrderResult>;

public record CreatePurchaseOrderResult(int PurchaseOrderId, decimal TotalAmount, DateTime CreatedAt);
