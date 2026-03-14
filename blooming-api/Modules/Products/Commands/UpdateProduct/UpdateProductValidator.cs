using FluentValidation;

namespace blooming_api.Modules.Products.Commands.UpdateProduct;

public class UpdateProductValidator : AbstractValidator<UpdateProductCommand>
{
    private static readonly string[] AllowedImageTypes = ["image/jpeg", "image/png"];
    private const long MaxImageSizeBytes = 5 * 1024 * 1024;

    public UpdateProductValidator()
    {
        RuleFor(x => x.ProductId)
            .GreaterThan(0).WithMessage("El id de producto es inválido");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre es requerido")
            .MaximumLength(ProductsConstants.NameMaxLength)
                .WithMessage($"El nombre no puede superar {ProductsConstants.NameMaxLength} caracteres");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0).WithMessage("La categoría es requerida");

        RuleFor(x => x.Variants)
            .NotEmpty().WithMessage("Se requiere al menos una variante");

        RuleForEach(x => x.Variants).ChildRules(variant =>
        {
            variant.RuleFor(v => v.Size)
                .NotEmpty().WithMessage("El talle es requerido")
                .MaximumLength(ProductsConstants.SizeMaxLength)
                    .WithMessage($"El talle no puede superar {ProductsConstants.SizeMaxLength} caracteres");

            variant.RuleFor(v => v.Color)
                .NotEmpty().WithMessage("El color es requerido")
                .MaximumLength(ProductsConstants.ColorMaxLength)
                    .WithMessage($"El color no puede superar {ProductsConstants.ColorMaxLength} caracteres");

            variant.RuleFor(v => v.CostPrice)
                .GreaterThan(0).WithMessage("El precio de costo debe ser mayor a 0");

            variant.RuleFor(v => v.MarkupPercentage)
                .GreaterThanOrEqualTo(0).WithMessage("El porcentaje de recargo no puede ser negativo");
        });

        When(x => x.Image != null, () =>
        {
            RuleFor(x => x.Image!.ContentType)
                .Must(t => AllowedImageTypes.Contains(t))
                .WithMessage("La imagen debe ser JPEG o PNG");

            RuleFor(x => x.Image!.Length)
                .LessThanOrEqualTo(MaxImageSizeBytes)
                .WithMessage("La imagen no puede superar 5MB");
        });
    }
}
