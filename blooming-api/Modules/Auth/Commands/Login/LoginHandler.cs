using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Auth;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Auth.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Auth.Commands.Login;

public class LoginHandler : IRequestHandler<LoginCommand, LoginResponse>
{
    private readonly AppDbContext _db;
    private readonly JwtService _jwtService;

    public LoginHandler(AppDbContext db, JwtService jwtService)
    {
        _db = db;
        _jwtService = jwtService;
    }

    public async Task<LoginResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new BusinessRuleException("Credenciales incorrectas");

        var token = _jwtService.GenerateToken(user.Id, user.Email);

        return new LoginResponse { Token = token };
    }
}
