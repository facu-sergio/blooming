using System.Security.Claims;
using blooming_api.Modules.Configuracion.Commands.AjustarFondoReposicion;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace blooming_api.Modules.Configuracion.Controllers;

[ApiController]
[Route("api/configuracion")]
[Authorize]
public class ConfiguracionController : ControllerBase
{
    private readonly IMediator _mediator;

    public ConfiguracionController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("fondo-reposicion/ajuste")]
    public async Task<IActionResult> AjustarFondoReposicion([FromBody] AjustarFondoReposicionRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        await _mediator.Send(new AjustarFondoReposicionCommand(request.NuevoSaldo, request.Motivo, userId));
        return NoContent();
    }
}

public record AjustarFondoReposicionRequest(decimal NuevoSaldo, string Motivo);
