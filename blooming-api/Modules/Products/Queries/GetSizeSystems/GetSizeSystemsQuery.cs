using blooming_api.Modules.Products.DTOs;
using MediatR;

namespace blooming_api.Modules.Products.Queries.GetSizeSystems;

public record GetSizeSystemsQuery : IRequest<List<SizeSystemResponse>>;
