using blooming_api.Modules.Suppliers.DTOs;
using MediatR;

namespace blooming_api.Modules.Suppliers.Queries.GetSuppliers;

public record GetSuppliersQuery(
    string? SearchTerm = null,
    int Page = 1,
    int PageSize = 1000
) : IRequest<PagedSuppliersResult>;

public record PagedSuppliersResult(
    List<SupplierResponse> Items,
    int TotalCount,
    int Page,
    int PageSize
);
