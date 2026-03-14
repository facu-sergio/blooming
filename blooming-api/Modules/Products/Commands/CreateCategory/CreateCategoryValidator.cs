using FluentValidation;

namespace blooming_api.Modules.Products.Commands.CreateCategory;

public class CreateCategoryValidator : AbstractValidator<CreateCategoryCommand>
{
    public CreateCategoryValidator()
    {
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
