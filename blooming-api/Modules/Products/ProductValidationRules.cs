using blooming_api.Modules.Products.DTOs;
using FluentValidation;
using System.Linq.Expressions;

namespace blooming_api.Modules.Products;

public static class ProductValidationRules
{
    public static readonly string[] AllowedImageTypes = ["image/jpeg", "image/png"];
    public const long MaxImageSizeBytes = 5 * 1024 * 1024;

    public static void ApplyVariantRules(AbstractValidator<CreateVariantDto> v)
    {
        ApplyVariantRulesCore(v, x => x.Size, x => x.Color, x => x.CostPrice, x => x.MarkupPercentage);
        v.RuleFor(x => x.LowStockThreshold)
            .GreaterThanOrEqualTo(0).WithMessage("El umbral de stock bajo no puede ser negativo")
            .When(x => x.LowStockThreshold.HasValue);
    }

    public static void ApplyVariantRules(AbstractValidator<UpdateVariantDto> v)
    {
        ApplyVariantRulesCore(v, x => x.Size, x => x.Color, x => x.CostPrice, x => x.MarkupPercentage);
        v.RuleFor(x => x.LowStockThreshold)
            .GreaterThanOrEqualTo(0).WithMessage("El umbral de stock bajo no puede ser negativo")
            .When(x => x.LowStockThreshold.HasValue);
    }

    public static void ApplyImageRules<TCommand>(
        AbstractValidator<TCommand> validator,
        Expression<Func<TCommand, string>> contentTypeExpr,
        Expression<Func<TCommand, long>> lengthExpr,
        Func<TCommand, bool> condition)
    {
        validator.RuleFor(contentTypeExpr)
            .Must(t => AllowedImageTypes.Contains(t))
            .WithMessage("La imagen debe ser JPEG o PNG")
            .When(condition);

        validator.RuleFor(lengthExpr)
            .LessThanOrEqualTo(MaxImageSizeBytes)
            .WithMessage("La imagen no puede superar 5MB")
            .When(condition);
    }

    private static void ApplyVariantRulesCore<T>(
        AbstractValidator<T> v,
        Expression<Func<T, string>> sizeExpr,
        Expression<Func<T, string>> colorExpr,
        Expression<Func<T, decimal>> costPriceExpr,
        Expression<Func<T, decimal>> markupExpr)
    {
        v.RuleFor(sizeExpr)
            .NotEmpty().WithMessage("El talle es requerido")
            .MaximumLength(ProductsConstants.SizeMaxLength)
                .WithMessage($"El talle no puede superar {ProductsConstants.SizeMaxLength} caracteres");

        v.RuleFor(colorExpr)
            .NotEmpty().WithMessage("El color es requerido")
            .MaximumLength(ProductsConstants.ColorMaxLength)
                .WithMessage($"El color no puede superar {ProductsConstants.ColorMaxLength} caracteres");

        v.RuleFor(costPriceExpr)
            .GreaterThan(0).WithMessage("El precio de costo debe ser mayor a 0");

        v.RuleFor(markupExpr)
            .GreaterThanOrEqualTo(0).WithMessage("El porcentaje de recargo no puede ser negativo");
    }
}
