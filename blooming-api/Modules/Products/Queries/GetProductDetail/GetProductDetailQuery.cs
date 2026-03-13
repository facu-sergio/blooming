using blooming_api.Modules.Products.DTOs;
using MediatR;

namespace blooming_api.Modules.Products.Queries.GetProductDetail;

public record GetProductDetailQuery(int ProductId) : IRequest<ProductResponse>;
