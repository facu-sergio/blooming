using blooming_api.Modules.Products.DTOs;
using MediatR;

namespace blooming_api.Modules.Products.Commands.UpdateColor;

public record UpdateColorCommand(int ColorId, string? Name, string? DisplayName, decimal? SortOrder) : IRequest<ColorAdminResponse>;
