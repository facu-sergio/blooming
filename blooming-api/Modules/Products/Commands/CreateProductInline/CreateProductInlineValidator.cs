using blooming_api.Modules.Products;
using FluentValidation;

namespace blooming_api.Modules.Products.Commands.CreateProductInline;

public class CreateProductInlineValidator : AbstractValidator<CreateProductInlineCommand>
{
    public CreateProductInlineValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(ProductsConstants.NameMaxLength);
        RuleFor(x => x.CategoryId).GreaterThan(0);
        RuleFor(x => x.Size).NotEmpty().MaximumLength(ProductsConstants.SizeMaxLength);
        RuleFor(x => x.Color).NotEmpty().MaximumLength(ProductsConstants.ColorMaxLength);
        RuleFor(x => x.MarkupPercentage).GreaterThanOrEqualTo(0);
        RuleFor(x => x.LowStockThreshold).GreaterThanOrEqualTo(0).When(x => x.LowStockThreshold.HasValue);
    }
}
