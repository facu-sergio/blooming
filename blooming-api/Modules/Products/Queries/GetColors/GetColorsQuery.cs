using blooming_api.Modules.Products.DTOs;
using MediatR;

namespace blooming_api.Modules.Products.Queries.GetColors;

public record GetColorsQuery : IRequest<List<ColorResponse>>;
