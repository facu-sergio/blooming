using blooming_api.Common;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Configuracion;
using blooming_api.Modules.Configuracion.Entities;
using blooming_api.Modules.Suppliers.Commands.CreatePurchaseOrder;
using blooming_api.Modules.Suppliers.Entities;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace blooming_api.Tests.Suppliers;

public class CreatePurchaseOrderFondoReposicionTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly CreatePurchaseOrderHandler _handler;

    public CreatePurchaseOrderFondoReposicionTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        _db = new AppDbContext(options);
        _handler = new CreatePurchaseOrderHandler(_db);
    }

    private async Task<(Supplier supplier, ProductVariant variant)> SeedDataAsync()
    {
        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Name = "Test Proveedor",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.Suppliers.Add(supplier);

        var product = new Product { Name = "Producto Test", CategoryId = 1, CreatedAt = DateTime.UtcNow };
        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        var variant = new ProductVariant
        {
            ProductId = product.Id,
            SizeId = 1,
            ColorId = 1,
            CostPrice = 500m,
            MarkupPercentage = 50m,
            SellingPrice = 750m,
            Stock = 10,
            CreatedAt = DateTime.UtcNow
        };
        _db.ProductVariants.Add(variant);
        await _db.SaveChangesAsync();

        return (supplier, variant);
    }

    [Fact]
    public async Task Handle_AlCrearOC_DescontaSaldoFondoExistente()
    {
        var (supplier, variant) = await SeedDataAsync();

        _db.ConfiguracionNegocio.Add(new ConfiguracionNegocio
        {
            Id = ConfiguracionConstants.ConfiguracionId,
            SaldoFondo = 5000m,
            UpdatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();

        var command = new CreatePurchaseOrderCommand(
            supplier.Id,
            new List<CreatePurchaseOrderItemDto> { new(variant.Id, 2, 600m) },
            null
        );
        await _handler.Handle(command, CancellationToken.None);

        var config = await _db.ConfiguracionNegocio.FirstAsync();
        Assert.Equal(3800m, config.SaldoFondo); // 5000 - (2 * 600)
    }

    [Fact]
    public async Task Handle_AlCrearOC_InsertaRegistroDeAuditoria()
    {
        var (supplier, variant) = await SeedDataAsync();

        _db.ConfiguracionNegocio.Add(new ConfiguracionNegocio
        {
            Id = ConfiguracionConstants.ConfiguracionId,
            SaldoFondo = 3000m,
            UpdatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();

        var command = new CreatePurchaseOrderCommand(
            supplier.Id,
            new List<CreatePurchaseOrderItemDto> { new(variant.Id, 1, 1000m) },
            null
        );
        var result = await _handler.Handle(command, CancellationToken.None);

        var auditoria = await _db.AuditoriaFondoReposicion.FirstAsync();
        Assert.Equal(3000m, auditoria.SaldoAnterior);
        Assert.Equal(2000m, auditoria.SaldoNuevo); // 3000 - 1000
        Assert.Contains($"#{result.PurchaseOrderId}", auditoria.Motivo);
        Assert.Null(auditoria.UsuarioId);
    }

    [Fact]
    public async Task Handle_SinConfiguracionPrevia_CreaRegistroYDescuenta()
    {
        var (supplier, variant) = await SeedDataAsync();

        var command = new CreatePurchaseOrderCommand(
            supplier.Id,
            new List<CreatePurchaseOrderItemDto> { new(variant.Id, 2, 500m) },
            null
        );
        await _handler.Handle(command, CancellationToken.None);

        var config = await _db.ConfiguracionNegocio.FirstAsync();
        Assert.Equal(-1000m, config.SaldoFondo); // 0 - (2 * 500)

        var auditoria = await _db.AuditoriaFondoReposicion.FirstAsync();
        Assert.Equal(0m, auditoria.SaldoAnterior);
        Assert.Equal(-1000m, auditoria.SaldoNuevo);
    }

    [Fact]
    public async Task Handle_SaldoFondoPuedeSerNegativo()
    {
        var (supplier, variant) = await SeedDataAsync();

        _db.ConfiguracionNegocio.Add(new ConfiguracionNegocio
        {
            Id = ConfiguracionConstants.ConfiguracionId,
            SaldoFondo = 200m,
            UpdatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();

        var command = new CreatePurchaseOrderCommand(
            supplier.Id,
            new List<CreatePurchaseOrderItemDto> { new(variant.Id, 3, 500m) },
            null
        );
        await _handler.Handle(command, CancellationToken.None);

        var config = await _db.ConfiguracionNegocio.FirstAsync();
        Assert.Equal(-1300m, config.SaldoFondo); // 200 - 1500
    }

    public void Dispose() => _db.Dispose();
}
