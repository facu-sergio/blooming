using FluentValidation;

namespace blooming_api.Modules.Products.Commands.CreateProduct;

public class CreateProductValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre es requerido")
            .MaximumLength(ProductsConstants.NameMaxLength)
                .WithMessage($"El nombre no puede superar {ProductsConstants.NameMaxLength} caracteres");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0).WithMessage("La categoría es requerida");

        RuleFor(x => x.Variants)
            .NotEmpty().WithMessage("Se requiere al menos una variante");

        RuleForEach(x => x.Variants).ChildRules(ProductValidationRules.ApplyVariantRules);

        ProductValidationRules.ApplyImageRules(
            this,
            x => x.Image!.ContentType,
            x => x.Image!.Length,
            x => x.Image != null);
    }
}
