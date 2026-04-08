using FluentValidation;

namespace blooming_api.Modules.Suppliers.Commands.CreateSupplier;

public class CreateSupplierValidator : AbstractValidator<CreateSupplierCommand>
{
    public CreateSupplierValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre es requerido")
            .MaximumLength(SuppliersConstants.NameMaxLength)
                .WithMessage($"El nombre no puede superar {SuppliersConstants.NameMaxLength} caracteres");

        RuleFor(x => x.ContactInfo)
            .MaximumLength(SuppliersConstants.ContactInfoMaxLength)
                .WithMessage($"El contacto no puede superar {SuppliersConstants.ContactInfoMaxLength} caracteres")
            .When(x => x.ContactInfo != null);

        RuleFor(x => x.Notes)
            .MaximumLength(SuppliersConstants.NotesMaxLength)
                .WithMessage($"Las notas no pueden superar {SuppliersConstants.NotesMaxLength} caracteres")
            .When(x => x.Notes != null);
    }
}
