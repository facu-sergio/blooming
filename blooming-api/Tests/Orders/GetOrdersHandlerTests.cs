using blooming_api.Common;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Customers.Entities;
using blooming_api.Modules.Orders.Entities;
using blooming_api.Modules.Orders.Queries.GetOrders;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace blooming_api.Tests.Orders;

public class GetOrdersHandlerTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly GetOrdersHandler _handler;

    public GetOrdersHandlerTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _db = new AppDbContext(options);
        _handler = new GetOrdersHandler(_db);
        SeedData();
    }

    private void SeedData()
    {
        var customer1 = new Customer { Id = 1, Name = "Ana García", Phone = "1111", CreatedAt = DateTime.UtcNow };
        var customer2 = new Customer { Id = 2, Name = "Carlos López", Phone = "2222", CreatedAt = DateTime.UtcNow };
        _db.Customers.AddRange(customer1, customer2);

        _db.Orders.AddRange(
            new Order
            {
                Id = 1,
                CustomerId = 1,
                Customer = customer1,
                Status = OrderStatus.Pending,
                Total = 1000m,
                CreatedAt = new DateTime(2026, 1, 10, 0, 0, 0, DateTimeKind.Utc),
            },
            new Order
            {
                Id = 2,
                CustomerId = 1,
                Customer = customer1,
                Status = OrderStatus.Confirmed,
                Total = 2000m,
                CreatedAt = new DateTime(2026, 2, 15, 0, 0, 0, DateTimeKind.Utc),
            },
            new Order
            {
                Id = 3,
                CustomerId = 2,
                Customer = customer2,
                Status = OrderStatus.Shipped,
                Total = 3000m,
                CreatedAt = new DateTime(2026, 3, 20, 0, 0, 0, DateTimeKind.Utc),
            }
        );
        _db.SaveChanges();
    }

    [Fact]
    public async Task Handle_SinFiltros_RetornaTodosLosPedidos()
    {
        var query = new GetOrdersQuery(null, null, null, null, 1, 20);
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.Equal(3, result.TotalCount);
        Assert.Equal(3, result.Items.Count);
    }

    [Fact]
    public async Task Handle_FiltrandoPorStatus_RetornaSoloPedidosDelEstado()
    {
        var query = new GetOrdersQuery("Pending", null, null, null, 1, 20);
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.Equal(1, result.TotalCount);
        Assert.All(result.Items, item => Assert.Equal("Pendiente", item.Status));
    }

    [Fact]
    public async Task Handle_FiltrandoPorStatusInvalido_IgnoraFiltroYRetornaTodos()
    {
        // Si el status no puede parsearse como enum, el filtro se ignora silenciosamente
        var query = new GetOrdersQuery("EstadoInexistente", null, null, null, 1, 20);
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.Equal(3, result.TotalCount);
    }

    [Fact]
    public async Task Handle_FiltrandoPorCustomerId_RetornaSoloPedidosDelCliente()
    {
        var query = new GetOrdersQuery(null, null, null, 2, 1, 20);
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.Equal(1, result.TotalCount);
        Assert.All(result.Items, item => Assert.Equal(2, item.CustomerId));
    }

    [Fact]
    public async Task Handle_FiltrandoPorFromDate_RetornaPedidosDesdeFecha()
    {
        var from = new DateTime(2026, 2, 1, 0, 0, 0, DateTimeKind.Utc);
        var query = new GetOrdersQuery(null, from, null, null, 1, 20);
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.Equal(2, result.TotalCount);
        Assert.All(result.Items, item => Assert.True(item.CreatedAt >= from));
    }

    [Fact]
    public async Task Handle_FiltrandoPorToDate_RetornaPedidosHastaFecha()
    {
        var to = new DateTime(2026, 2, 28, 23, 59, 59, DateTimeKind.Utc);
        var query = new GetOrdersQuery(null, null, to, null, 1, 20);
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.Equal(2, result.TotalCount);
        Assert.All(result.Items, item => Assert.True(item.CreatedAt <= to));
    }

    [Fact]
    public async Task Handle_FiltrandoPorRangoFechas_RetornaPedidosEnRango()
    {
        var from = new DateTime(2026, 2, 1, 0, 0, 0, DateTimeKind.Utc);
        var to = new DateTime(2026, 2, 28, 23, 59, 59, DateTimeKind.Utc);
        var query = new GetOrdersQuery(null, from, to, null, 1, 20);
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.Equal(1, result.TotalCount);
        Assert.Equal(2, result.Items[0].Id);
    }

    [Fact]
    public async Task Handle_Paginacion_RetornaSoloPedidosDeLaPagina()
    {
        var query = new GetOrdersQuery(null, null, null, null, 1, 2);
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.Equal(3, result.TotalCount);
        Assert.Equal(2, result.Items.Count);
        Assert.Equal(1, result.Page);
        Assert.Equal(2, result.PageSize);
    }

    [Fact]
    public async Task Handle_SegundaPagina_RetornaPedidosRestantes()
    {
        var query = new GetOrdersQuery(null, null, null, null, 2, 2);
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.Equal(3, result.TotalCount);
        Assert.Single(result.Items);
    }

    [Fact]
    public async Task Handle_OrdenadoPorFechaDescendente_PrimerItemEsElMasReciente()
    {
        var query = new GetOrdersQuery(null, null, null, null, 1, 20);
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.Equal(3, result.Items[0].Id); // Order 3 es la más reciente (marzo)
        Assert.Equal(2, result.Items[1].Id);
        Assert.Equal(1, result.Items[2].Id);
    }

    [Fact]
    public async Task Handle_MapeaClienteCorrectamente()
    {
        var query = new GetOrdersQuery(null, null, null, 1, 1, 20);
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.All(result.Items, item => Assert.Equal("Ana García", item.CustomerName));
    }

    [Fact]
    public async Task Handle_StatusKey_EsElNombreDelEnum()
    {
        var query = new GetOrdersQuery("Confirmed", null, null, null, 1, 20);
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.Single(result.Items);
        Assert.Equal("Confirmed", result.Items[0].StatusKey);
        Assert.Equal("Confirmado", result.Items[0].Status);
    }

    public void Dispose() => _db.Dispose();
}
