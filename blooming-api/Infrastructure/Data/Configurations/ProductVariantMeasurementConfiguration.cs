using blooming_api.Common;
using blooming_api.Modules.Products;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace blooming_api.Infrastructure.Data.Configurations;

public class ProductVariantMeasurementConfiguration : IEntityTypeConfiguration<ProductVariantMeasurement>
{
    public void Configure(EntityTypeBuilder<ProductVariantMeasurement> builder)
    {
        builder.ToTable("product_variant_measurements");
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(m => m.ProductVariantId).HasColumnName("product_variant_id").IsRequired();
        builder.Property(m => m.MeasurementName)
            .HasColumnName("measurement_name")
            .IsRequired()
            .HasMaxLength(ProductsConstants.MeasurementNameMaxLength);
        builder.Property(m => m.ValueInCm)
            .HasColumnName("value_in_cm")
            .HasColumnType($"decimal({ProductsConstants.MeasurementValuePrecision},{ProductsConstants.MeasurementValueScale})")
            .IsRequired();
        builder.Property(m => m.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(m => m.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(m => m.ProductVariant)
            .WithMany(v => v.Measurements)
            .HasForeignKey(m => m.ProductVariantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(m => new { m.ProductVariantId, m.MeasurementName }).IsUnique();
    }
}
