using FluentValidation;

namespace blooming_api.Modules.Orders.Commands.ConfirmOrder;

public class ConfirmOrderCommandValidator : AbstractValidator<ConfirmOrderCommand>
{
    public ConfirmOrderCommandValidator()
    {
        RuleFor(x => x.OrderId)
            .GreaterThan(0)
            .WithMessage("El ID del pedido es requerido");

        RuleFor(x => x.ConfirmedByUserId)
            .GreaterThan(0)
            .WithMessage("El usuario que confirma es requerido");
    }
}
