using blooming_api.Modules.Products.DTOs;
using MediatR;

namespace blooming_api.Modules.Products.Queries.SearchProducts;

public record SearchProductsQuery(SearchProductsRequest Request) : IRequest<List<ProductResponse>>;
