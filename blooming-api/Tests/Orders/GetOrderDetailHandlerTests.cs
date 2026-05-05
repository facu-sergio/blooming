using blooming_api.Common;
using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Customers.Entities;
using blooming_api.Modules.Orders.Entities;
using blooming_api.Modules.Orders.Queries.GetOrderDetail;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace blooming_api.Tests.Orders;

public class GetOrderDetailHandlerTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly GetOrderDetailHandler _handler;

    public GetOrderDetailHandlerTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _db = new AppDbContext(options);
        _handler = new GetOrderDetailHandler(_db);
        SeedData();
    }

    private void SeedData()
    {
        var customer = new Customer { Id = 1, Name = "Ana García", Phone = "1111", CreatedAt = DateTime.UtcNow };
        _db.Customers.Add(customer);

        var product = new Product { Id = 1, Name = "Remera", CategoryId = 1, CreatedAt = DateTime.UtcNow };
        _db.Products.Add(product);

        var size = new Size { Id = 1, SizeSystemId = 1, Name = "m", DisplayName = "M", SortOrder = 1, IsActive = true };
        var color = new Color { Id = 1, Name = "azul", DisplayName = "Azul", SortOrder = 1, IsActive = true };
        _db.Sizes.Add(size);
        _db.Colors.Add(color);

        var variant = new ProductVariant
        {
            Id = 5,
            ProductId = 1,
            Product = product,
            SizeId = 1,
            Size = size,
            ColorId = 1,
            Color = color,
            SellingPrice = 2500m,
            Stock = 10,
            CreatedAt = DateTime.UtcNow,
        };
        _db.ProductVariants.Add(variant);

        var now = new DateTime(2026, 3, 24, 10, 0, 0, DateTimeKind.Utc);
        var order = new Order
        {
            Id = 42,
            CustomerId = 1,
            Customer = customer,
            Status = OrderStatus.Confirmed,
            Total = 5000m,
            Discount = 0m,
            ShippingAddress = "Av. Corrientes 1234",
            Notes = "Sin cuello",
            EstimatedDeliveryDate = new DateTime(2026, 4, 1, 0, 0, 0, DateTimeKind.Utc),
            CreatedAt = now,
            ConfirmedAt = now.AddHours(1),
            Items = new List<OrderItem>
            {
                new OrderItem
                {
                    Id = 1,
                    ProductVariantId = 5,
                    ProductVariant = variant,
                    Quantity = 2,
                    UnitPrice = 2500m,
                    LineTotal = 5000m,
                }
            }
        };
        _db.Orders.Add(order);
        _db.SaveChanges();
    }

    [Fact]
    public async Task Handle_PedidoExistente_RetornaDetalleCompleto()
    {
        var query = new GetOrderDetailQuery(42);
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(42, result.Id);
        Assert.Equal(1, result.CustomerId);
        Assert.Equal("Ana García", result.CustomerName);
        Assert.Equal("Confirmado", result.Status);
        Assert.Equal("Confirmed", result.StatusKey);
        Assert.Equal(5000m, result.Total);
    }

    [Fact]
    public async Task Handle_PedidoExistente_RetornaItemsConDetalle()
    {
        var query = new GetOrderDetailQuery(42);
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.Single(result.Items);
        var item = result.Items[0];
        Assert.Equal(1, item.Id);
        Assert.Equal(5, item.ProductVariantId);
        Assert.Equal("Remera", item.ProductName);
        Assert.Equal("M Azul", item.VariantLabel);
        Assert.Equal(2500m, item.UnitPrice);
        Assert.Equal(2, item.Quantity);
        Assert.Equal(5000m, item.LineTotal);
    }

    [Fact]
    public async Task Handle_PedidoExistente_RetornaDatosDeEntrega()
    {
        var query = new GetOrderDetailQuery(42);
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.Equal("Av. Corrientes 1234", result.ShippingAddress);
        Assert.Equal("Sin cuello", result.Notes);
        Assert.NotNull(result.EstimatedDeliveryDate);
    }

    [Fact]
    public async Task Handle_PedidoConfirmado_RetornaTimestampsDeTransicion()
    {
        var query = new GetOrderDetailQuery(42);
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.NotNull(result.ConfirmedAt);
        Assert.Null(result.ShippedAt);
        Assert.Null(result.DeliveredAt);
        Assert.Null(result.CancelledAt);
    }

    [Fact]
    public async Task Handle_PedidoNoExistente_LanzaNotFoundException()
    {
        var query = new GetOrderDetailQuery(999);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _handler.Handle(query, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_VariantLabel_CombinaSizeYColor()
    {
        var query = new GetOrderDetailQuery(42);
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.Equal("M Azul", result.Items[0].VariantLabel);
    }

    [Fact]
    public async Task Handle_PedidoConDescuento_RetornaDescuento()
    {
        var query = new GetOrderDetailQuery(42);
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.Equal(0m, result.Discount);
    }

    public void Dispose() => _db.Dispose();
}
