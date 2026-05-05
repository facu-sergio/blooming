using FluentValidation;

namespace blooming_api.Modules.Products.Commands.CreateColor;

public class CreateColorValidator : AbstractValidator<CreateColorCommand>
{
    public CreateColorValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre es requerido")
            .MaximumLength(ColorsConstants.NameMaxLength)
                .WithMessage($"El nombre no puede superar {ColorsConstants.NameMaxLength} caracteres");

        RuleFor(x => x.DisplayName)
            .MaximumLength(ColorsConstants.DisplayNameMaxLength)
                .WithMessage($"El nombre visible no puede superar {ColorsConstants.DisplayNameMaxLength} caracteres")
            .When(x => x.DisplayName != null);
    }
}
