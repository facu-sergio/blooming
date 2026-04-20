using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Suppliers.DTOs;
using blooming_api.Modules.Suppliers.Entities;
using MediatR;

namespace blooming_api.Modules.Suppliers.Commands.CreateSupplier;

public class CreateSupplierHandler : IRequestHandler<CreateSupplierCommand, SupplierResponse>
{
    private readonly AppDbContext _db;

    public CreateSupplierHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<SupplierResponse> Handle(CreateSupplierCommand request, CancellationToken cancellationToken)
    {
        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Phone = request.Phone,
            Website = request.Website,
            Address = request.Address,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _db.Suppliers.Add(supplier);
        await _db.SaveChangesAsync(cancellationToken);

        return MapToResponse(supplier);
    }

    internal static SupplierResponse MapToResponse(Supplier supplier) => new()
    {
        Id = supplier.Id,
        Name = supplier.Name,
        Phone = supplier.Phone,
        Website = supplier.Website,
        Address = supplier.Address,
        Notes = supplier.Notes,
        CreatedAt = supplier.CreatedAt,
        UpdatedAt = supplier.UpdatedAt,
    };
}
