using blooming_api.Modules.Auth.DTOs;
using MediatR;

namespace blooming_api.Modules.Auth.Commands.RegisterUser;

public record RegisterUserCommand(string Email, string Password) : IRequest<RegisterUserResponse>;
