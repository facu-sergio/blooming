using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Suppliers.Commands.CreateSupplier;
using blooming_api.Modules.Suppliers.DTOs;
using MediatR;

namespace blooming_api.Modules.Suppliers.Commands.UpdateSupplier;

public class UpdateSupplierHandler : IRequestHandler<UpdateSupplierCommand, SupplierResponse>
{
    private readonly AppDbContext _db;

    public UpdateSupplierHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<SupplierResponse> Handle(UpdateSupplierCommand request, CancellationToken cancellationToken)
    {
        var supplier = await _db.Suppliers.FindAsync([request.SupplierId], cancellationToken)
            ?? throw new NotFoundException($"Proveedor {request.SupplierId} no encontrado");

        supplier.Name = request.Name;
        supplier.ContactInfo = request.ContactInfo;
        supplier.Notes = request.Notes;
        supplier.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        return CreateSupplierHandler.MapToResponse(supplier);
    }
}
