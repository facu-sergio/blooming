using blooming_api.Modules.Products;
using FluentValidation;

namespace blooming_api.Modules.Products.Commands.CreateProductInline;

public class CreateProductInlineValidator : AbstractValidator<CreateProductInlineCommand>
{
    public CreateProductInlineValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(ProductsConstants.NameMaxLength);
        RuleFor(x => x.CategoryId).GreaterThan(0);
        RuleFor(x => x.SizeId).GreaterThan(0).WithMessage("El talle es requerido");
        RuleFor(x => x.ColorId).GreaterThan(0).WithMessage("El color es requerido");
        RuleFor(x => x.MarkupPercentage).GreaterThanOrEqualTo(0);
        RuleFor(x => x.LowStockThreshold).GreaterThanOrEqualTo(0).When(x => x.LowStockThreshold.HasValue);
    }
}
