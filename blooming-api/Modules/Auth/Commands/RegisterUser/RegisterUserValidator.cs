using FluentValidation;

namespace blooming_api.Modules.Auth.Commands.RegisterUser;

public class RegisterUserValidator : AbstractValidator<RegisterUserCommand>
{
    public RegisterUserValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("El email es requerido")
            .EmailAddress().WithMessage("El formato del email no es válido")
            .MaximumLength(AuthConstants.EmailMaxLength)
                .WithMessage($"El email no puede superar {AuthConstants.EmailMaxLength} caracteres");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("La contraseña es requerida")
            .MinimumLength(AuthConstants.PasswordMinLength)
                .WithMessage($"La contraseña debe tener al menos {AuthConstants.PasswordMinLength} caracteres");
    }
}
