using blooming_api.Modules.Products.DTOs;
using MediatR;

namespace blooming_api.Modules.Products.Commands.ToggleColorActive;

public record ToggleColorActiveCommand(int ColorId) : IRequest<ColorAdminResponse>;
