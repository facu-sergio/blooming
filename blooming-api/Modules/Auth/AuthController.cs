using blooming_api.Modules.Auth.Commands.Login;
using blooming_api.Modules.Auth.Commands.RegisterUser;
using blooming_api.Modules.Auth.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace blooming_api.Modules.Auth;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var response = await _mediator.Send(new LoginCommand(request.Email, request.Password));
        return Ok(response);
    }

    [Authorize]
    [HttpPost("register")]
    public async Task<ActionResult<RegisterUserResponse>> Register([FromBody] RegisterUserRequest request)
    {
        var response = await _mediator.Send(new RegisterUserCommand(request.Email, request.Password));
        return CreatedAtAction(nameof(Register), response);
    }
}
