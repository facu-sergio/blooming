using blooming_api.Modules.Products.DTOs;
using MediatR;

namespace blooming_api.Modules.Products.Commands.CreateColor;

public record CreateColorCommand(string Name, string? DisplayName, decimal SortOrder = 0) : IRequest<ColorAdminResponse>;
