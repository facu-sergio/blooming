using blooming_api.Common;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Products.Entities;
using blooming_api.Modules.Suppliers.Entities;
using blooming_api.Modules.Suppliers.Queries.GetPurchaseOrders;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace blooming_api.Tests.Suppliers;

public class GetPurchaseOrdersBySupplierHandlerTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly GetPurchaseOrdersHandler _handler;

    private readonly Guid _supplierId1 = Guid.NewGuid();
    private readonly Guid _supplierId2 = Guid.NewGuid();

    public GetPurchaseOrdersBySupplierHandlerTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _db = new AppDbContext(options);
        _handler = new GetPurchaseOrdersHandler(_db);
        SeedData();
    }

    private void SeedData()
    {
        var supplier1 = new Supplier
        {
            Id = _supplierId1,
            Name = "Mayorista Uno",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var supplier2 = new Supplier
        {
            Id = _supplierId2,
            Name = "Mayorista Dos",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.Suppliers.AddRange(supplier1, supplier2);

        var product = new Product
        {
            Name = "Remera Test",
            CategoryId = 1,
            CreatedAt = DateTime.UtcNow
        };
        _db.Products.Add(product);
        _db.SaveChanges();

        var variant = new ProductVariant
        {
            ProductId = product.Id,
            Size = "M",
            Color = "Rojo",
            CostPrice = 1000m,
            MarkupPercentage = 50m,
            SellingPrice = 1500m,
            Stock = 10,
            CreatedAt = DateTime.UtcNow
        };
        _db.ProductVariants.Add(variant);
        _db.SaveChanges();

        _db.PurchaseOrders.AddRange(
            new PurchaseOrder
            {
                SupplierId = _supplierId1,
                Supplier = supplier1,
                OrderDate = new DateTime(2026, 1, 10, 0, 0, 0, DateTimeKind.Utc),
                TotalAmount = 5000m,
                CreatedAt = new DateTime(2026, 1, 10, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 1, 10, 0, 0, 0, DateTimeKind.Utc),
                Items = new List<PurchaseOrderItem>
                {
                    new PurchaseOrderItem
                    {
                        ProductVariantId = variant.Id,
                        ProductVariant = variant,
                        Quantity = 5,
                        UnitCostPrice = 1000m,
                        CreatedAt = DateTime.UtcNow
                    }
                }
            },
            new PurchaseOrder
            {
                SupplierId = _supplierId1,
                Supplier = supplier1,
                OrderDate = new DateTime(2026, 3, 20, 0, 0, 0, DateTimeKind.Utc),
                TotalAmount = 8000m,
                CreatedAt = new DateTime(2026, 3, 20, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 3, 20, 0, 0, 0, DateTimeKind.Utc),
                Items = new List<PurchaseOrderItem>
                {
                    new PurchaseOrderItem
                    {
                        ProductVariantId = variant.Id,
                        ProductVariant = variant,
                        Quantity = 8,
                        UnitCostPrice = 1000m,
                        CreatedAt = DateTime.UtcNow
                    }
                }
            },
            new PurchaseOrder
            {
                SupplierId = _supplierId2,
                Supplier = supplier2,
                OrderDate = new DateTime(2026, 2, 15, 0, 0, 0, DateTimeKind.Utc),
                TotalAmount = 3000m,
                CreatedAt = new DateTime(2026, 2, 15, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 2, 15, 0, 0, 0, DateTimeKind.Utc),
                Items = new List<PurchaseOrderItem>
                {
                    new PurchaseOrderItem
                    {
                        ProductVariantId = variant.Id,
                        ProductVariant = variant,
                        Quantity = 3,
                        UnitCostPrice = 1000m,
                        CreatedAt = DateTime.UtcNow
                    }
                }
            }
        );
        _db.SaveChanges();
    }

    [Fact]
    public async Task Handle_SinFiltroSupplierId_RetornaTodosLosPedidos()
    {
        var query = new GetPurchaseOrdersQuery();
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.Equal(3, result.TotalCount);
        Assert.Equal(3, result.Items.Count);
    }

    [Fact]
    public async Task Handle_ConSupplierId_RetornaSoloPedidosDelProveedor()
    {
        var query = new GetPurchaseOrdersQuery(SupplierId: _supplierId1);
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.Equal(2, result.Items.Count);
        Assert.All(result.Items, item => Assert.Equal(_supplierId1, item.SupplierId));
    }

    [Fact]
    public async Task Handle_ConSupplierId_RetornaListaVaciaSiNoTieneOrdenes()
    {
        var supplierSinOrdenes = Guid.NewGuid();
        var query = new GetPurchaseOrdersQuery(SupplierId: supplierSinOrdenes);
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.Empty(result.Items);
        Assert.Equal(0, result.TotalCount);
    }

    [Fact]
    public async Task Handle_ConSupplierId_RetornaOrdenadoPorFechaDescendente()
    {
        var query = new GetPurchaseOrdersQuery(SupplierId: _supplierId1);
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.Equal(2, result.Items.Count);
        Assert.True(result.Items[0].OrderDate >= result.Items[1].OrderDate);
    }

    [Fact]
    public async Task Handle_RetornaDto_ConDatosCorrectos()
    {
        var query = new GetPurchaseOrdersQuery(SupplierId: _supplierId2);
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.Single(result.Items);
        var item = result.Items[0];
        Assert.Equal(_supplierId2, item.SupplierId);
        Assert.Equal("Mayorista Dos", item.SupplierName);
        Assert.Equal(3000m, item.TotalAmount);
        Assert.Equal(1, item.ItemCount);
    }

    public void Dispose() => _db.Dispose();
}
