using blooming_api.Modules.Suppliers.DTOs;
using MediatR;

namespace blooming_api.Modules.Suppliers.Commands.UpdateSupplier;

public record UpdateSupplierCommand(Guid SupplierId, string Name, string? Phone, string? Website, string? Address, string? Notes) : IRequest<SupplierResponse>;
