using FluentValidation;

namespace blooming_api.Modules.Orders.Commands.CreateOrder;

public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(x => x.CustomerId)
            .GreaterThan(0)
            .WithMessage("El cliente es requerido");

        RuleFor(x => x.Items)
            .NotEmpty()
            .WithMessage("El pedido debe tener al menos un ítem");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductVariantId)
                .GreaterThan(0)
                .WithMessage("La variante de producto es requerida");

            item.RuleFor(i => i.Quantity)
                .GreaterThan(0)
                .WithMessage("La cantidad debe ser mayor a 0");
        });

        RuleFor(x => x.ShippingAddress)
            .MaximumLength(OrdersConstants.ShippingAddressMaxLength)
            .WithMessage($"La dirección no puede superar {OrdersConstants.ShippingAddressMaxLength} caracteres")
            .When(x => x.ShippingAddress != null);

        RuleFor(x => x.Notes)
            .MaximumLength(OrdersConstants.NotesMaxLength)
            .WithMessage($"Las notas no pueden superar {OrdersConstants.NotesMaxLength} caracteres")
            .When(x => x.Notes != null);

        RuleFor(x => x.EstimatedDeliveryDate)
            .GreaterThan(DateTime.UtcNow)
            .WithMessage("La fecha de entrega estimada debe ser una fecha futura")
            .When(x => x.EstimatedDeliveryDate.HasValue);
    }
}
