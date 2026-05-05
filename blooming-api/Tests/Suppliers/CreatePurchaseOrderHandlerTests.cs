using blooming_api.Common;
using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Products.Entities;
using blooming_api.Modules.Suppliers.Commands.CreatePurchaseOrder;
using blooming_api.Modules.Suppliers.Entities;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace blooming_api.Tests.Suppliers;

public class CreatePurchaseOrderHandlerTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly CreatePurchaseOrderHandler _handler;

    public CreatePurchaseOrderHandlerTests()
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
            Name = "Mayorista Test",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.Suppliers.Add(supplier);

        var product = new Product
        {
            Name = "Remera Test",
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
            CostPrice = 1000m,
            MarkupPercentage = 50m,
            SellingPrice = 1500m,
            Stock = 10,
            CreatedAt = DateTime.UtcNow
        };
        _db.ProductVariants.Add(variant);
        await _db.SaveChangesAsync();

        return (supplier, variant);
    }

    [Fact]
    public async Task Handle_OrdenValida_CreaOrdenYActualizaStock()
    {
        var (supplier, variant) = await SeedDataAsync();
        var stockInicial = variant.Stock;

        var command = new CreatePurchaseOrderCommand(
            supplier.Id,
            new List<CreatePurchaseOrderItemDto>
            {
                new(variant.Id, 5, 900m)
            },
            null
        );

        var result = await _handler.Handle(command, CancellationToken.None);

        Assert.True(result.PurchaseOrderId > 0);
        Assert.Equal(5 * 900m, result.TotalAmount);

        var variantActualizada = await _db.ProductVariants.FindAsync(variant.Id);
        Assert.Equal(stockInicial + 5, variantActualizada!.Stock);
        Assert.Equal(900m, variantActualizada.CostPrice);
    }

    [Fact]
    public async Task Handle_OrdenValida_CreaStockMovements()
    {
        var (supplier, variant) = await SeedDataAsync();

        var command = new CreatePurchaseOrderCommand(
            supplier.Id,
            new List<CreatePurchaseOrderItemDto>
            {
                new(variant.Id, 3, 800m)
            },
            null
        );

        var result = await _handler.Handle(command, CancellationToken.None);

        var movement = await _db.StockMovements
            .FirstOrDefaultAsync(m => m.PurchaseOrderId == result.PurchaseOrderId);

        Assert.NotNull(movement);
        Assert.Equal(MovementType.In, movement.MovementType);
        Assert.Equal(3, movement.Quantity);
        Assert.Equal(800m, movement.UnitCostPrice);
        Assert.Equal(variant.Id, movement.ProductVariantId);
    }

    [Fact]
    public async Task Handle_CalculaTotalCorrectamente_MultipleItems()
    {
        var (supplier, variant1) = await SeedDataAsync();

        var product2 = new Product
        {
            Name = "Pantalon Test",
            CategoryId = 1,
            CreatedAt = DateTime.UtcNow
        };
        _db.Products.Add(product2);
        await _db.SaveChangesAsync();

        var variant2 = new ProductVariant
        {
            ProductId = product2.Id,
            SizeId = 2,
            ColorId = 2,
            CostPrice = 2000m,
            MarkupPercentage = 50m,
            SellingPrice = 3000m,
            Stock = 5,
            CreatedAt = DateTime.UtcNow
        };
        _db.ProductVariants.Add(variant2);
        await _db.SaveChangesAsync();

        var command = new CreatePurchaseOrderCommand(
            supplier.Id,
            new List<CreatePurchaseOrderItemDto>
            {
                new(variant1.Id, 2, 500m),
                new(variant2.Id, 3, 700m)
            },
            null
        );

        var result = await _handler.Handle(command, CancellationToken.None);

        Assert.Equal(2 * 500m + 3 * 700m, result.TotalAmount);
    }

    [Fact]
    public async Task Handle_ProveedorNoExiste_LanzaNotFoundException()
    {
        var command = new CreatePurchaseOrderCommand(
            Guid.NewGuid(),
            new List<CreatePurchaseOrderItemDto> { new(1, 5, 100m) },
            null
        );

        await Assert.ThrowsAsync<NotFoundException>(() =>
            _handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_VarianteNoExiste_LanzaNotFoundException()
    {
        var (supplier, _) = await SeedDataAsync();

        var command = new CreatePurchaseOrderCommand(
            supplier.Id,
            new List<CreatePurchaseOrderItemDto> { new(99999, 5, 100m) },
            null
        );

        await Assert.ThrowsAsync<NotFoundException>(() =>
            _handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_GuardaOrdenConItems_EnBaseDeDatos()
    {
        var (supplier, variant) = await SeedDataAsync();

        var command = new CreatePurchaseOrderCommand(
            supplier.Id,
            new List<CreatePurchaseOrderItemDto>
            {
                new(variant.Id, 10, 1200m)
            },
            null
        );

        var result = await _handler.Handle(command, CancellationToken.None);

        var order = await _db.PurchaseOrders
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.Id == result.PurchaseOrderId);

        Assert.NotNull(order);
        Assert.Equal(supplier.Id, order.SupplierId);
        Assert.Single(order.Items);
        Assert.Equal(10, order.Items[0].Quantity);
        Assert.Equal(1200m, order.Items[0].UnitCostPrice);
    }

    [Fact]
    public async Task Handle_ActualizaPrecioCosto_DeVariante()
    {
        var (supplier, variant) = await SeedDataAsync();
        var precioOriginal = variant.CostPrice;
        var nuevoPrecio = precioOriginal + 500m;

        var command = new CreatePurchaseOrderCommand(
            supplier.Id,
            new List<CreatePurchaseOrderItemDto>
            {
                new(variant.Id, 1, nuevoPrecio)
            },
            null
        );

        await _handler.Handle(command, CancellationToken.None);

        var variantActualizada = await _db.ProductVariants.FindAsync(variant.Id);
        Assert.Equal(nuevoPrecio, variantActualizada!.CostPrice);
    }

    [Fact]
    public async Task Handle_ActualizaSellingPrice_CuandoCambiaCosto()
    {
        var (supplier, variant) = await SeedDataAsync();
        // variant.MarkupPercentage = 50m, CostPrice = 1000m => SellingPrice = 1500m
        var nuevoCosto = 2000m;
        var expectedSellingPrice = nuevoCosto * (1 + variant.MarkupPercentage / 100);

        var command = new CreatePurchaseOrderCommand(
            supplier.Id,
            new List<CreatePurchaseOrderItemDto> { new(variant.Id, 1, nuevoCosto) },
            null
        );

        await _handler.Handle(command, CancellationToken.None);

        var variantActualizada = await _db.ProductVariants.FindAsync(variant.Id);
        Assert.Equal(nuevoCosto, variantActualizada!.CostPrice);
        Assert.Equal(expectedSellingPrice, variantActualizada.SellingPrice);
    }

    [Fact]
    public async Task Handle_CreaRegistroHistorialPrecios_AlActualizarCosto()
    {
        var (supplier, variant) = await SeedDataAsync();
        var nuevoCosto = 1200m;

        var command = new CreatePurchaseOrderCommand(
            supplier.Id,
            new List<CreatePurchaseOrderItemDto> { new(variant.Id, 5, nuevoCosto) },
            null
        );

        var result = await _handler.Handle(command, CancellationToken.None);

        var history = await _db.ProductVariantPriceHistories
            .FirstOrDefaultAsync(h => h.ProductVariantId == variant.Id);

        Assert.NotNull(history);
        Assert.Equal(nuevoCosto, history.CostPrice);
        Assert.Equal(result.PurchaseOrderId, history.PurchaseOrderId);
        Assert.Equal(nuevoCosto * (1 + variant.MarkupPercentage / 100), history.SellingPrice);
    }

    public void Dispose() => _db.Dispose();
}
