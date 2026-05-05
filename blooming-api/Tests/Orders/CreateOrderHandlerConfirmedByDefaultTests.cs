using blooming_api.Common;
using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Customers.Entities;
using blooming_api.Modules.Orders.Commands.CreateOrder;
using blooming_api.Modules.Orders.Entities;
using blooming_api.Modules.Products.Entities;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace blooming_api.Tests.Orders;

public class CreateOrderHandlerConfirmedByDefaultTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly CreateOrderHandler _handler;

    public CreateOrderHandlerConfirmedByDefaultTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        _db = new AppDbContext(options);
        _handler = new CreateOrderHandler(_db);
    }

    private async Task<(Customer customer, ProductVariant variant)> SeedDataAsync(int stock = 10)
    {
        var customer = new Customer
        {
            Name = "Test Cliente",
            Phone = "1234567890",
            CreatedAt = DateTime.UtcNow
        };
        _db.Customers.Add(customer);

        var product = new Product
        {
            Name = "Remera",
            CategoryId = 1,
            CreatedAt = DateTime.UtcNow
        };
        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        var variant = new ProductVariant
        {
            ProductId = product.Id,
            SizeId = 1,
            ColorId = 1,
            CostPrice = 800m,
            MarkupPercentage = 50m,
            SellingPrice = 1200m,
            Stock = stock,
            CreatedAt = DateTime.UtcNow
        };
        _db.ProductVariants.Add(variant);
        await _db.SaveChangesAsync();

        return (customer, variant);
    }

    [Fact]
    public async Task Handle_AlCrearPedido_EstadoEsConfirmado()
    {
        var (customer, variant) = await SeedDataAsync();
        var command = new CreateOrderCommand(customer.Id, [new(variant.Id, 2)], null, null, null, 1);

        var result = await _handler.Handle(command, CancellationToken.None);

        var order = await _db.Orders.FindAsync(result.OrderId);
        Assert.NotNull(order);
        Assert.Equal(OrderStatus.Confirmed, order.Status);
    }

    [Fact]
    public async Task Handle_AlCrearPedido_ConfirmedAtEsEstablecido()
    {
        var (customer, variant) = await SeedDataAsync();
        var antes = DateTime.UtcNow.AddSeconds(-1);
        var command = new CreateOrderCommand(customer.Id, [new(variant.Id, 1)], null, null, null, 1);

        var result = await _handler.Handle(command, CancellationToken.None);

        var order = await _db.Orders.FindAsync(result.OrderId);
        Assert.NotNull(order?.ConfirmedAt);
        Assert.True(order.ConfirmedAt >= antes);
    }

    [Fact]
    public async Task Handle_AlCrearPedido_StockEsDescontado()
    {
        var (customer, variant) = await SeedDataAsync(stock: 10);
        var command = new CreateOrderCommand(customer.Id, [new(variant.Id, 3)], null, null, null, 1);

        await _handler.Handle(command, CancellationToken.None);

        var updated = await _db.ProductVariants.FindAsync(variant.Id);
        Assert.Equal(7, updated!.Stock);
    }

    [Fact]
    public async Task Handle_AlCrearPedido_RegistraMovimientoSalida()
    {
        var (customer, variant) = await SeedDataAsync();
        var command = new CreateOrderCommand(customer.Id, [new(variant.Id, 2)], null, null, null, 1);

        var result = await _handler.Handle(command, CancellationToken.None);

        var movement = await _db.StockMovements
            .FirstOrDefaultAsync(m => m.OrderId == result.OrderId && m.ProductVariantId == variant.Id);

        Assert.NotNull(movement);
        Assert.Equal(MovementType.Out, movement.MovementType);
        Assert.Equal(2, movement.Quantity);
    }

    [Fact]
    public async Task Handle_StockInsuficiente_LanzaExcepcionYNoCreaElPedido()
    {
        var (customer, variant) = await SeedDataAsync(stock: 2);
        var command = new CreateOrderCommand(customer.Id, [new(variant.Id, 5)], null, null, null, 1);

        await Assert.ThrowsAsync<BusinessRuleException>(() =>
            _handler.Handle(command, CancellationToken.None));

        var count = await _db.Orders.CountAsync();
        Assert.Equal(0, count);
    }

    [Fact]
    public async Task Handle_StockInsuficiente_NoDescuentaNingunStock()
    {
        var (customer, variant) = await SeedDataAsync(stock: 2);
        var stockOriginal = variant.Stock;
        var command = new CreateOrderCommand(customer.Id, [new(variant.Id, 5)], null, null, null, 1);

        await Assert.ThrowsAsync<BusinessRuleException>(() =>
            _handler.Handle(command, CancellationToken.None));

        var updated = await _db.ProductVariants.FindAsync(variant.Id);
        Assert.Equal(stockOriginal, updated!.Stock);
    }

    [Fact]
    public async Task Handle_StockInsuficiente_NoRegistraMovimientos()
    {
        var (customer, variant) = await SeedDataAsync(stock: 2);
        var command = new CreateOrderCommand(customer.Id, [new(variant.Id, 5)], null, null, null, 1);

        await Assert.ThrowsAsync<BusinessRuleException>(() =>
            _handler.Handle(command, CancellationToken.None));

        var count = await _db.StockMovements.CountAsync();
        Assert.Equal(0, count);
    }

    public void Dispose() => _db.Dispose();
}
