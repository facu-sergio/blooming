using FluentValidation;

namespace blooming_api.Modules.Products.Commands.UpdateColor;

public class UpdateColorValidator : AbstractValidator<UpdateColorCommand>
{
    public UpdateColorValidator()
    {
        RuleFor(x => x.ColorId)
            .GreaterThan(0).WithMessage("El id de color es inválido");

        RuleFor(x => x.Name)
            .MaximumLength(ColorsConstants.NameMaxLength)
                .WithMessage($"El nombre no puede superar {ColorsConstants.NameMaxLength} caracteres")
            .When(x => x.Name != null);

        RuleFor(x => x.DisplayName)
            .MaximumLength(ColorsConstants.DisplayNameMaxLength)
                .WithMessage($"El nombre visible no puede superar {ColorsConstants.DisplayNameMaxLength} caracteres")
            .When(x => x.DisplayName != null);
    }
}
