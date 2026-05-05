using blooming_api.Common;
using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Products.Entities;
using blooming_api.Modules.Suppliers.Entities;
using blooming_api.Modules.Suppliers.Queries.GetPurchaseOrderDetail;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace blooming_api.Tests.Suppliers;

public class GetPurchaseOrderDetailHandlerTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly GetPurchaseOrderDetailHandler _handler;

    private int _purchaseOrderId;

    public GetPurchaseOrderDetailHandlerTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _db = new AppDbContext(options);
        _handler = new GetPurchaseOrderDetailHandler(_db);
        SeedData();
    }

    private void SeedData()
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

        var sizeM = new Size { SizeSystemId = 1, Name = "m", DisplayName = "M", SortOrder = 1, IsActive = true };
        var sizeL = new Size { SizeSystemId = 1, Name = "l", DisplayName = "L", SortOrder = 2, IsActive = true };
        var colorRojo = new Color { Name = "rojo", DisplayName = "Rojo", SortOrder = 1, IsActive = true };
        var colorAzul = new Color { Name = "azul", DisplayName = "Azul", SortOrder = 2, IsActive = true };
        _db.Sizes.AddRange(sizeM, sizeL);
        _db.Colors.AddRange(colorRojo, colorAzul);
        _db.SaveChanges();

        var variant1 = new ProductVariant
        {
            ProductId = product.Id,
            SizeId = sizeM.Id,
            Size = sizeM,
            ColorId = colorRojo.Id,
            Color = colorRojo,
            CostPrice = 1000m,
            MarkupPercentage = 50m,
            SellingPrice = 1500m,
            Stock = 10,
            CreatedAt = DateTime.UtcNow
        };
        var variant2 = new ProductVariant
        {
            ProductId = product.Id,
            SizeId = sizeL.Id,
            Size = sizeL,
            ColorId = colorAzul.Id,
            Color = colorAzul,
            CostPrice = 1200m,
            MarkupPercentage = 50m,
            SellingPrice = 1800m,
            Stock = 5,
            CreatedAt = DateTime.UtcNow
        };
        _db.ProductVariants.AddRange(variant1, variant2);
        _db.SaveChanges();

        var order = new PurchaseOrder
        {
            SupplierId = supplier.Id,
            Supplier = supplier,
            OrderDate = new DateTime(2026, 3, 15, 0, 0, 0, DateTimeKind.Utc),
            TotalAmount = 7400m,
            CreatedAt = new DateTime(2026, 3, 15, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 3, 15, 0, 0, 0, DateTimeKind.Utc),
            Items = new List<PurchaseOrderItem>
            {
                new PurchaseOrderItem
                {
                    ProductVariantId = variant1.Id,
                    ProductVariant = variant1,
                    Quantity = 5,
                    UnitCostPrice = 1000m,
                    CreatedAt = DateTime.UtcNow
                },
                new PurchaseOrderItem
                {
                    ProductVariantId = variant2.Id,
                    ProductVariant = variant2,
                    Quantity = 2,
                    UnitCostPrice = 1200m,
                    CreatedAt = DateTime.UtcNow
                }
            }
        };
        _db.PurchaseOrders.Add(order);
        _db.SaveChanges();

        _purchaseOrderId = order.Id;
    }

    [Fact]
    public async Task Handle_OrdenExistente_RetornaDetalle()
    {
        var query = new GetPurchaseOrderDetailQuery(_purchaseOrderId);
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(_purchaseOrderId, result.Id);
        Assert.Equal("Mayorista Test", result.SupplierName);
        Assert.Equal(7400m, result.TotalAmount);
    }

    [Fact]
    public async Task Handle_OrdenExistente_RetornaItemsConDetalle()
    {
        var query = new GetPurchaseOrderDetailQuery(_purchaseOrderId);
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.Equal(2, result.Items.Count);
    }

    [Fact]
    public async Task Handle_Item_TieneVarianteLabel()
    {
        var query = new GetPurchaseOrderDetailQuery(_purchaseOrderId);
        var result = await _handler.Handle(query, CancellationToken.None);

        var primerItem = result.Items.First();
        Assert.Contains("M", primerItem.VariantLabel);
        Assert.Contains("Rojo", primerItem.VariantLabel);
    }

    [Fact]
    public async Task Handle_Item_CalculaLineTotalCorrectamente()
    {
        var query = new GetPurchaseOrderDetailQuery(_purchaseOrderId);
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.All(result.Items, item =>
            Assert.Equal(item.UnitCostPrice * item.Quantity, item.LineTotal));
    }

    [Fact]
    public async Task Handle_Item_TieneNombreDeProducto()
    {
        var query = new GetPurchaseOrderDetailQuery(_purchaseOrderId);
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.All(result.Items, item =>
            Assert.Equal("Remera Test", item.ProductName));
    }

    [Fact]
    public async Task Handle_OrdenInexistente_LanzaNotFoundException()
    {
        var query = new GetPurchaseOrderDetailQuery(99999);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            _handler.Handle(query, CancellationToken.None));
    }

    public void Dispose() => _db.Dispose();
}
