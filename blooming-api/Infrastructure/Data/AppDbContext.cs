using System.Reflection;
using blooming_api.Common;
using blooming_api.Modules.Configuracion.Entities;
using blooming_api.Modules.Customers.Entities;
using blooming_api.Modules.Orders.Entities;
using blooming_api.Modules.Products.Entities;
using blooming_api.Modules.Suppliers.Entities;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<ProductVariant> ProductVariants { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<SizeSystem> SizeSystems { get; set; }
    public DbSet<Size> Sizes { get; set; }
    public DbSet<Color> Colors { get; set; }
    public DbSet<ProductVariantMeasurement> ProductVariantMeasurements { get; set; }
    public DbSet<StockMovement> StockMovements { get; set; }
    public DbSet<Customer> Customers { get; set; }

    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Supplier> Suppliers { get; set; }
    public DbSet<PurchaseOrder> PurchaseOrders { get; set; }
    public DbSet<PurchaseOrderItem> PurchaseOrderItems { get; set; }
    public DbSet<ProductVariantPriceHistory> ProductVariantPriceHistories { get; set; }
    public DbSet<ConfiguracionNegocio> ConfiguracionNegocio { get; set; }
    public DbSet<AuditoriaFondoReposicion> AuditoriaFondoReposicion { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        base.OnModelCreating(modelBuilder);
    }
}
