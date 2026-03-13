using blooming_api.Modules.Auth.DTOs;
using MediatR;

namespace blooming_api.Modules.Auth.Commands.Login;

public record LoginCommand(string Email, string Password) : IRequest<LoginResponse>;
