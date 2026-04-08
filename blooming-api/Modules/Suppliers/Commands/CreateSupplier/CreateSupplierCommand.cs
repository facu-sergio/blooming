using blooming_api.Modules.Suppliers.DTOs;
using MediatR;

namespace blooming_api.Modules.Suppliers.Commands.CreateSupplier;

public record CreateSupplierCommand(string Name, string? ContactInfo, string? Notes) : IRequest<SupplierResponse>;
