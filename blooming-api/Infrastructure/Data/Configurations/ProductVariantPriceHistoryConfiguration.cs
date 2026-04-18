using blooming_api.Modules.Products.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace blooming_api.Infrastructure.Data.Configurations;

public class ProductVariantPriceHistoryConfiguration : IEntityTypeConfiguration<ProductVariantPriceHistory>
{
    public void Configure(EntityTypeBuilder<ProductVariantPriceHistory> builder)
    {
        builder.ToTable("product_variant_price_history");
        builder.HasKey(h => h.Id);
        builder.Property(h => h.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(h => h.ProductVariantId).HasColumnName("product_variant_id").IsRequired();
        builder.Property(h => h.CostPrice).HasColumnName("cost_price").HasColumnType("decimal(18,2)").IsRequired();
        builder.Property(h => h.SellingPrice).HasColumnName("selling_price").HasColumnType("decimal(18,2)").IsRequired();
        builder.Property(h => h.MarkupPercentage).HasColumnName("markup_percentage").HasColumnType("decimal(18,2)").IsRequired();
        builder.Property(h => h.PurchaseOrderId).HasColumnName("purchase_order_id");
        builder.Property(h => h.CreatedAt).HasColumnName("created_at").IsRequired();

        builder.HasOne(h => h.ProductVariant)
            .WithMany()
            .HasForeignKey(h => h.ProductVariantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(h => h.PurchaseOrder)
            .WithMany()
            .HasForeignKey(h => h.PurchaseOrderId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
