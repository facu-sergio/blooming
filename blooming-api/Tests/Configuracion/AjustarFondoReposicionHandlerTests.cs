using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Configuracion;
using blooming_api.Modules.Configuracion.Commands.AjustarFondoReposicion;
using blooming_api.Modules.Configuracion.Entities;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace blooming_api.Tests.Configuracion;

public class AjustarFondoReposicionHandlerTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly AjustarFondoReposicionHandler _handler;

    public AjustarFondoReposicionHandlerTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        _db = new AppDbContext(options);
        _handler = new AjustarFondoReposicionHandler(_db);
    }

    [Fact]
    public async Task Handle_ActualizaSaldoFondoAlNuevoValor()
    {
        _db.ConfiguracionNegocio.Add(new ConfiguracionNegocio
        {
            Id = ConfiguracionConstants.ConfiguracionId,
            SaldoFondo = 1000m,
            UpdatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();

        var command = new AjustarFondoReposicionCommand(2500m, "Corrección manual de saldo", 5);
        await _handler.Handle(command, CancellationToken.None);

        var config = await _db.ConfiguracionNegocio.FirstAsync();
        Assert.Equal(2500m, config.SaldoFondo);
    }

    [Fact]
    public async Task Handle_InsertaRegistroDeAuditoria()
    {
        _db.ConfiguracionNegocio.Add(new ConfiguracionNegocio
        {
            Id = ConfiguracionConstants.ConfiguracionId,
            SaldoFondo = 800m,
            UpdatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();

        var command = new AjustarFondoReposicionCommand(1200m, "Ajuste por error de cálculo", 3);
        await _handler.Handle(command, CancellationToken.None);

        var auditoria = await _db.AuditoriaFondoReposicion.FirstAsync();
        Assert.Equal(800m, auditoria.SaldoAnterior);
        Assert.Equal(1200m, auditoria.SaldoNuevo);
        Assert.Equal("Ajuste por error de cálculo", auditoria.Motivo);
        Assert.Equal(3, auditoria.UsuarioId);
    }

    [Fact]
    public async Task Handle_SinConfiguracionPrevia_CreaRegistroYAjusta()
    {
        var command = new AjustarFondoReposicionCommand(500m, "Inicialización de saldo", 1);
        await _handler.Handle(command, CancellationToken.None);

        var config = await _db.ConfiguracionNegocio.FirstAsync();
        Assert.Equal(500m, config.SaldoFondo);

        var auditoria = await _db.AuditoriaFondoReposicion.FirstAsync();
        Assert.Equal(0m, auditoria.SaldoAnterior);
        Assert.Equal(500m, auditoria.SaldoNuevo);
    }

    [Fact]
    public async Task Handle_RegistraTimestampEnAuditoria()
    {
        _db.ConfiguracionNegocio.Add(new ConfiguracionNegocio
        {
            Id = ConfiguracionConstants.ConfiguracionId,
            SaldoFondo = 0m,
            UpdatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();

        var antes = DateTime.UtcNow.AddSeconds(-1);
        var command = new AjustarFondoReposicionCommand(100m, "Test timestamp", 2);
        await _handler.Handle(command, CancellationToken.None);
        var despues = DateTime.UtcNow.AddSeconds(1);

        var auditoria = await _db.AuditoriaFondoReposicion.FirstAsync();
        Assert.True(auditoria.CreatedAt >= antes && auditoria.CreatedAt <= despues);
    }

    public void Dispose() => _db.Dispose();
}
