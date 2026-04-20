using FluentValidation;

namespace blooming_api.Modules.Customers.Commands.CreateCustomer;

public class CreateCustomerValidator : AbstractValidator<CreateCustomerCommand>
{
    public CreateCustomerValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre es requerido")
            .MaximumLength(CustomersConstants.NameMaxLength)
                .WithMessage($"El nombre no puede superar {CustomersConstants.NameMaxLength} caracteres");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("El teléfono es requerido")
            .MaximumLength(CustomersConstants.PhoneMaxLength)
                .WithMessage($"El teléfono no puede superar {CustomersConstants.PhoneMaxLength} caracteres");

        RuleFor(x => x.Address)
            .MaximumLength(CustomersConstants.AddressMaxLength)
                .WithMessage($"La dirección no puede superar {CustomersConstants.AddressMaxLength} caracteres")
            .When(x => x.Address != null);

        RuleFor(x => x.Notes)
            .MaximumLength(CustomersConstants.NotesMaxLength)
                .WithMessage($"Las notas no pueden superar {CustomersConstants.NotesMaxLength} caracteres")
            .When(x => x.Notes != null);
    }
}
