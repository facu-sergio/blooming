using MediatR;

namespace blooming_api.Modules.Configuracion.Commands.AjustarFondoReposicion;

public record AjustarFondoReposicionCommand(
    decimal NuevoSaldo,
    string Motivo,
    int UsuarioId
) : IRequest;
