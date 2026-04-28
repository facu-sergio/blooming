using blooming_api.Modules.Orders.Entities;
using MediatR;

namespace blooming_api.Modules.Orders.Commands.ChangeOrderStatus;

public record ChangeOrderStatusCommand(
    int OrderId,
    string NewStatus,
    int ChangedByUserId,
    DateTime? DeliveredAt = null
) : IRequest<ChangeOrderStatusResult>;

public record ChangeOrderStatusResult(
    int OrderId,
    string Status,
    DateTime ChangedAt
);
