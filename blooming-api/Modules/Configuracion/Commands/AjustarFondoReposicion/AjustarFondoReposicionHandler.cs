using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Configuracion.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Configuracion.Commands.AjustarFondoReposicion;

public class AjustarFondoReposicionHandler : IRequestHandler<AjustarFondoReposicionCommand>
{
    private readonly AppDbContext _db;

    public AjustarFondoReposicionHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task Handle(AjustarFondoReposicionCommand request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;

        var config = await _db.ConfiguracionNegocio
            .FirstOrDefaultAsync(cancellationToken);

        if (config == null)
        {
            config = new ConfiguracionNegocio
            {
                Id = ConfiguracionConstants.ConfiguracionId,
                SaldoFondo = 0m,
                UpdatedAt = now
            };
            _db.ConfiguracionNegocio.Add(config);
            await _db.SaveChangesAsync(cancellationToken);
        }

        var saldoAnterior = config.SaldoFondo;
        config.SaldoFondo = request.NuevoSaldo;
        config.UpdatedAt = now;

        _db.AuditoriaFondoReposicion.Add(new AuditoriaFondoReposicion
        {
            SaldoAnterior = saldoAnterior,
            SaldoNuevo = request.NuevoSaldo,
            Motivo = request.Motivo,
            UsuarioId = request.UsuarioId,
            CreatedAt = now
        });

        await _db.SaveChangesAsync(cancellationToken);
    }
}
