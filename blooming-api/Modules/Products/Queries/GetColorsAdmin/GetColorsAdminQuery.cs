using blooming_api.Modules.Products.DTOs;
using MediatR;

namespace blooming_api.Modules.Products.Queries.GetColorsAdmin;

public record GetColorsAdminQuery : IRequest<List<ColorAdminResponse>>;
