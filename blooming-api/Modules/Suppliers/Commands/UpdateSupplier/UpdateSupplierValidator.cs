using FluentValidation;

namespace blooming_api.Modules.Suppliers.Commands.UpdateSupplier;

public class UpdateSupplierValidator : AbstractValidator<UpdateSupplierCommand>
{
    public UpdateSupplierValidator()
    {
        RuleFor(x => x.SupplierId)
            .NotEmpty().WithMessage("El Id del proveedor es requerido");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre es requerido")
            .MaximumLength(SuppliersConstants.NameMaxLength)
                .WithMessage($"El nombre no puede superar {SuppliersConstants.NameMaxLength} caracteres");

        RuleFor(x => x.Phone)
            .MaximumLength(SuppliersConstants.PhoneMaxLength)
                .WithMessage($"El teléfono no puede superar {SuppliersConstants.PhoneMaxLength} caracteres")
            .When(x => x.Phone != null);

        RuleFor(x => x.Website)
            .MaximumLength(SuppliersConstants.WebsiteMaxLength)
                .WithMessage($"El sitio web no puede superar {SuppliersConstants.WebsiteMaxLength} caracteres")
            .When(x => x.Website != null);

        RuleFor(x => x.Address)
            .MaximumLength(SuppliersConstants.AddressMaxLength)
                .WithMessage($"La dirección no puede superar {SuppliersConstants.AddressMaxLength} caracteres")
            .When(x => x.Address != null);

        RuleFor(x => x.Notes)
            .MaximumLength(SuppliersConstants.NotesMaxLength)
                .WithMessage($"Las notas no pueden superar {SuppliersConstants.NotesMaxLength} caracteres")
            .When(x => x.Notes != null);
    }
}
