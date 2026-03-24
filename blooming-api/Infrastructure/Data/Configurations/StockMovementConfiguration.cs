using blooming_api.Modules.Products.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace blooming_api.Infrastructure.Data.Configurations;

public class StockMovementConfiguration : IEntityTypeConfiguration<StockMovement>
{
    public void Configure(EntityTypeBuilder<StockMovement> builder)
    {
        builder.ToTable("stock_movements");
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(m => m.ProductVariantId).HasColumnName("product_variant_id").IsRequired();
        builder.Property(m => m.MovementType)
            .HasColumnName("movement_type")
            .HasConversion<string>()
            .IsRequired();
        builder.Property(m => m.Quantity).HasColumnName("quantity").IsRequired();
        builder.Property(m => m.OrderId).HasColumnName("order_id");
        builder.Property(m => m.PurchaseOrderId).HasColumnName("purchase_order_id");
        builder.Property(m => m.CreatedAt).HasColumnName("created_at").IsRequired();

        builder.HasOne(m => m.ProductVariant)
            .WithMany()
            .HasForeignKey(m => m.ProductVariantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(m => m.ProductVariantId);
        builder.HasIndex(m => m.CreatedAt);
    }
}
