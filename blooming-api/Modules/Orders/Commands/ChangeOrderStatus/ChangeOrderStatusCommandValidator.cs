using blooming_api.Modules.Orders.Entities;
using FluentValidation;

namespace blooming_api.Modules.Orders.Commands.ChangeOrderStatus;

public class ChangeOrderStatusCommandValidator : AbstractValidator<ChangeOrderStatusCommand>
{
    public ChangeOrderStatusCommandValidator()
    {
        RuleFor(x => x.OrderId)
            .GreaterThan(0)
            .WithMessage("El ID del pedido es requerido");

        RuleFor(x => x.NewStatus)
            .NotEmpty()
            .WithMessage("El nuevo estado es requerido")
            .Must(s => Enum.TryParse<OrderStatus>(s, ignoreCase: false, out _))
            .WithMessage($"El estado no es válido. Valores permitidos: {string.Join(", ", Enum.GetNames<OrderStatus>())}");

        RuleFor(x => x.ChangedByUserId)
            .GreaterThan(0)
            .WithMessage("El usuario que realiza el cambio es requerido");

        RuleFor(x => x.DeliveredAt)
            .Must(d => d == null || d.Value.ToUniversalTime() <= DateTime.UtcNow)
            .WithMessage("La fecha de entrega no puede ser en el futuro");
    }
}
