using blooming_api.Modules.Products.DTOs;
using MediatR;

namespace blooming_api.Modules.Products.Queries.GetProducts;

public record GetProductsQuery : IRequest<List<ProductResponse>>;
