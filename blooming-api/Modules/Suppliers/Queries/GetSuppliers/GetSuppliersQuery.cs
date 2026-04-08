using blooming_api.Modules.Suppliers.DTOs;
using MediatR;

namespace blooming_api.Modules.Suppliers.Queries.GetSuppliers;

public record GetSuppliersQuery(string? SearchTerm) : IRequest<List<SupplierResponse>>;
