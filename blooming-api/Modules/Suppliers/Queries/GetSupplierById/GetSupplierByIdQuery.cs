using blooming_api.Modules.Suppliers.DTOs;
using MediatR;

namespace blooming_api.Modules.Suppliers.Queries.GetSupplierById;

public record GetSupplierByIdQuery(Guid SupplierId) : IRequest<SupplierResponse>;
