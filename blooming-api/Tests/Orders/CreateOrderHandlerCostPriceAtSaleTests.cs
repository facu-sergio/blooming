using blooming_api.Common;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Customers.Entities;
using blooming_api.Modules.Orders.Commands.CreateOrder;
using blooming_api.Modules.Orders.Entities;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace blooming_api.Tests.Orders;

public class CreateOrderHandlerCostPriceAtSaleTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly CreateOrderHandler _handler;

    public CreateOrderHandlerCostPriceAtSaleTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        _db = new AppDbContext(options);
        _handler = new CreateOrderHandler(_db);
    }

    private async Task<(Customer customer, ProductVariant variant)> SeedDataAsync()
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
            Stock = 10,
            CreatedAt = DateTime.UtcNow
        };
        _db.ProductVariants.Add(variant);
        await _db.SaveChangesAsync();

        return (customer, variant);
    }

    [Fact]
    public async Task Handle_AlCrearPedido_SeteaCostPriceAtSale()
    {
        var (customer, variant) = await SeedDataAsync();

        var command = new CreateOrderCommand(
            customer.Id,
            new List<OrderItemDto> { new(variant.Id, 2) },
            null, null, null, 1
        );

        var result = await _handler.Handle(command, CancellationToken.None);

        var orderItem = await _db.OrderItems
            .FirstOrDefaultAsync(i => i.OrderId == result.OrderId);

        Assert.NotNull(orderItem);
        Assert.Equal(variant.CostPrice, orderItem.CostPriceAtSale);
    }

    [Fact]
    public async Task Handle_CostPriceAtSale_EsElCostoAlMomentoDeCreacion()
    {
        var (customer, variant) = await SeedDataAsync();
        var costoOriginal = variant.CostPrice;

        var command = new CreateOrderCommand(
            customer.Id,
            new List<OrderItemDto> { new(variant.Id, 1) },
            null, null, null, 1
        );

        var result = await _handler.Handle(command, CancellationToken.None);

        // Modificar el costo DESPUÉS del pedido
        variant.CostPrice = 9999m;
        await _db.SaveChangesAsync();

        var orderItem = await _db.OrderItems
            .FirstOrDefaultAsync(i => i.OrderId == result.OrderId);

        // El costo en el pedido debe ser el original, no el nuevo
        Assert.Equal(costoOriginal, orderItem!.CostPriceAtSale);
    }

    public void Dispose() => _db.Dispose();
}
