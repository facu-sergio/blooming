using blooming_api.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace blooming_api.Infrastructure.Data.Configurations;

public class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariant>
{
    public void Configure(EntityTypeBuilder<ProductVariant> builder)
    {
        builder.ToTable("product_variants");
        builder.HasKey(v => v.Id);
        builder.Property(v => v.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(v => v.ProductId).HasColumnName("product_id").IsRequired();
        builder.Property(v => v.SizeId).HasColumnName("size_id").IsRequired();
        builder.Property(v => v.ColorId).HasColumnName("color_id").IsRequired();
        builder.Property(v => v.CostPrice).HasColumnName("cost_price").HasColumnType("decimal(18,2)").IsRequired();
        builder.Property(v => v.MarkupPercentage).HasColumnName("markup_percentage").HasColumnType("decimal(18,2)").IsRequired();
        builder.Property(v => v.SellingPrice).HasColumnName("selling_price").HasColumnType("decimal(18,2)").IsRequired();
        builder.Property(v => v.Stock).HasColumnName("stock").HasDefaultValue(0).IsRequired();
        builder.Property(v => v.LowStockThreshold).HasColumnName("low_stock_threshold");
        builder.Property(v => v.ImageUrl).HasColumnName("image_url").HasMaxLength(500);
        builder.Property(v => v.Description).HasColumnName("description").HasMaxLength(255);
        builder.Property(v => v.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(v => v.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(v => v.Product)
            .WithMany(p => p.Variants)
            .HasForeignKey(v => v.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(v => v.Size)
            .WithMany()
            .HasForeignKey(v => v.SizeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(v => v.Color)
            .WithMany()
            .HasForeignKey(v => v.ColorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(v => new { v.ProductId, v.SizeId, v.ColorId }).IsUnique();
    }
}
