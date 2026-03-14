using FluentValidation;

namespace blooming_api.Modules.Products.Commands.UpdateCategory;

public class UpdateCategoryValidator : AbstractValidator<UpdateCategoryCommand>
{
    public UpdateCategoryValidator()
    {
        RuleFor(x => x.CategoryId)
            .GreaterThan(0).WithMessage("El id de categoría es inválido");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre es requerido")
            .MaximumLength(CategoriesConstants.NameMaxLength)
                .WithMessage($"El nombre no puede superar {CategoriesConstants.NameMaxLength} caracteres");

        RuleFor(x => x.Description)
            .MaximumLength(CategoriesConstants.DescriptionMaxLength)
                .WithMessage($"La descripción no puede superar {CategoriesConstants.DescriptionMaxLength} caracteres")
            .When(x => x.Description != null);
    }
}
