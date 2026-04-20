using FluentValidation;

namespace blooming_api.Modules.Suppliers.Commands.CreatePurchaseOrder;

public class CreatePurchaseOrderValidator : AbstractValidator<CreatePurchaseOrderCommand>
{
    public CreatePurchaseOrderValidator()
    {
        RuleFor(x => x.SupplierId)
            .NotEmpty().WithMessage("El proveedor es requerido");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("La orden debe tener al menos un ítem");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductVariantId)
                .GreaterThan(0).WithMessage("El ID de variante debe ser mayor a 0");

            item.RuleFor(i => i.Quantity)
                .GreaterThan(0).WithMessage("La cantidad debe ser mayor a 0");

            item.RuleFor(i => i.UnitCostPrice)
                .GreaterThan(0).WithMessage("El precio unitario debe ser mayor a 0");
        });
    }
}
