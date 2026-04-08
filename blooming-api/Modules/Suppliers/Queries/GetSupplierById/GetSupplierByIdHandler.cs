using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Suppliers.Commands.CreateSupplier;
using blooming_api.Modules.Suppliers.DTOs;
using MediatR;

namespace blooming_api.Modules.Suppliers.Queries.GetSupplierById;

public class GetSupplierByIdHandler : IRequestHandler<GetSupplierByIdQuery, SupplierResponse>
{
    private readonly AppDbContext _db;

    public GetSupplierByIdHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<SupplierResponse> Handle(GetSupplierByIdQuery request, CancellationToken cancellationToken)
    {
        var supplier = await _db.Suppliers.FindAsync([request.SupplierId], cancellationToken)
            ?? throw new NotFoundException($"Proveedor {request.SupplierId} no encontrado");

        return CreateSupplierHandler.MapToResponse(supplier);
    }
}
