using MediatR;

namespace blooming_api.Modules.Orders.Commands.ConfirmOrder;

public record ConfirmOrderCommand(
    int OrderId,
    int ConfirmedByUserId
) : IRequest<ConfirmOrderResult>;

public record ConfirmOrderResult(
    int OrderId,
    string Status,
    DateTime ConfirmedAt
);
