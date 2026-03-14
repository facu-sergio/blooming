using FluentValidation;

namespace blooming_api.Modules.Products.Commands.DeleteCategory;

public class DeleteCategoryValidator : AbstractValidator<DeleteCategoryCommand>
{
    public DeleteCategoryValidator()
    {
        RuleFor(x => x.CategoryId)
            .GreaterThan(0).WithMessage("El id de categoría es inválido");
    }
}
