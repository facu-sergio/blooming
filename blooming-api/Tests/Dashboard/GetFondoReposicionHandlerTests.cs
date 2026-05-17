using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Configuracion.Entities;
using blooming_api.Modules.Dashboard.Queries.GetFondoReposicion;
using blooming_api.Modules.Orders.Entities;
using blooming_api.Modules.Suppliers.Entities;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace blooming_api.Tests.Dashboard;

public class GetFondoReposicionHandlerTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly GetFondoReposicionHandler _handler;

    public GetFondoReposicionHandlerTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        _db = new AppDbContext(options);
        _handler = new GetFondoReposicionHandler(_db);
    }

    [Fact]
    public async Task Handle_SinOrdenesDeCompra_RetornaCeroEnAmbosValores()
    {
        var result = await _handler.Handle(new GetFondoReposicionQuery(), CancellationToken.None);

        Assert.Equal(0m, result.FondoCalculado);
        Assert.Equal(0m, result.SaldoFondo);
    }

    [Fact]
    public async Task Handle_ConOCPeroSinPedidos_RetornaFondoCalculadoCero()
    {
        var supplier = new Supplier { Name = "Proveedor Test", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _db.Suppliers.Add(supplier);
        await _db.SaveChangesAsync();

        _db.PurchaseOrders.Add(new PurchaseOrder
        {
            SupplierId = supplier.Id,
            OrderDate = DateTime.UtcNow.AddDays(-10),
            TotalAmount = 5000m,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();

        var result = await _handler.Handle(new GetFondoReposicionQuery(), CancellationToken.None);

        Assert.Equal(0m, result.FondoCalculado);
    }

    [Fact]
    public async Task Handle_ConPedidosConfirmadosDesdeUltimaOC_CalculaFondoCorrectamente()
    {
        var supplier = new Supplier { Name = "Proveedor Test", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _db.Suppliers.Add(supplier);
        await _db.SaveChangesAsync();

        var ocDate = DateTime.UtcNow.AddDays(-5);
        _db.PurchaseOrders.Add(new PurchaseOrder
        {
            SupplierId = supplier.Id,
            OrderDate = ocDate,
            TotalAmount = 3000m,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });

        var order = new Order
        {
            CustomerId = 1,
            Status = OrderStatus.Confirmed,
            Total = 1200m,
            CreatedAt = ocDate.AddDays(1),
            Items = new List<OrderItem>
            {
                new() { ProductVariantId = 1, Quantity = 3, UnitPrice = 400m, LineTotal = 1200m, CostPriceAtSale = 250m }
            }
        };
        _db.Orders.Add(order);

        _db.ConfiguracionNegocio.Add(new ConfiguracionNegocio
        {
            Id = 1,
            SaldoFondo = 1500m,
            UpdatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();

        var result = await _handler.Handle(new GetFondoReposicionQuery(), CancellationToken.None);

        Assert.Equal(750m, result.FondoCalculado); // 250 * 3
        Assert.Equal(1500m, result.SaldoFondo);
    }

    [Fact]
    public async Task Handle_PedidosCanceladosNoCuentanEnFondo()
    {
        var supplier = new Supplier { Name = "Proveedor Test", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _db.Suppliers.Add(supplier);
        await _db.SaveChangesAsync();

        var ocDate = DateTime.UtcNow.AddDays(-5);
        _db.PurchaseOrders.Add(new PurchaseOrder
        {
            SupplierId = supplier.Id,
            OrderDate = ocDate,
            TotalAmount = 2000m,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });

        var cancelledOrder = new Order
        {
            CustomerId = 1,
            Status = OrderStatus.Cancelled,
            Total = 800m,
            CreatedAt = ocDate.AddDays(1),
            Items = new List<OrderItem>
            {
                new() { ProductVariantId = 1, Quantity = 2, UnitPrice = 400m, LineTotal = 800m, CostPriceAtSale = 200m }
            }
        };
        _db.Orders.Add(cancelledOrder);
        await _db.SaveChangesAsync();

        var result = await _handler.Handle(new GetFondoReposicionQuery(), CancellationToken.None);

        Assert.Equal(0m, result.FondoCalculado);
    }

    [Fact]
    public async Task Handle_PedidosAnterioresAUltimaOCNoCuentan()
    {
        var supplier = new Supplier { Name = "Proveedor Test", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _db.Suppliers.Add(supplier);
        await _db.SaveChangesAsync();

        var ocDate = DateTime.UtcNow.AddDays(-5);
        _db.PurchaseOrders.Add(new PurchaseOrder
        {
            SupplierId = supplier.Id,
            OrderDate = ocDate,
            TotalAmount = 2000m,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });

        var anteriorOrder = new Order
        {
            CustomerId = 1,
            Status = OrderStatus.Delivered,
            Total = 600m,
            CreatedAt = ocDate.AddDays(-1),
            Items = new List<OrderItem>
            {
                new() { ProductVariantId = 1, Quantity = 2, UnitPrice = 300m, LineTotal = 600m, CostPriceAtSale = 150m }
            }
        };
        _db.Orders.Add(anteriorOrder);
        await _db.SaveChangesAsync();

        var result = await _handler.Handle(new GetFondoReposicionQuery(), CancellationToken.None);

        Assert.Equal(0m, result.FondoCalculado);
    }

    public void Dispose() => _db.Dispose();
}
