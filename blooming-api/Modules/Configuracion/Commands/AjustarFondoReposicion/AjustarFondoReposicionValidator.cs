using FluentValidation;

namespace blooming_api.Modules.Configuracion.Commands.AjustarFondoReposicion;

public class AjustarFondoReposicionValidator : AbstractValidator<AjustarFondoReposicionCommand>
{
    public AjustarFondoReposicionValidator()
    {
        RuleFor(x => x.Motivo)
            .NotEmpty().WithMessage("El motivo del ajuste es obligatorio.")
            .MaximumLength(ConfiguracionConstants.MotivoMaxLength);
    }
}
