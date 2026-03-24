using blooming_api.Modules.Orders.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace blooming_api.Infrastructure.Data.Configurations;

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.ToTable("order_items");
        builder.HasKey(oi => oi.Id);
        builder.Property(oi => oi.Id).HasColumnName("id").ValueGeneratedOnAdd();

        builder.Property(oi => oi.OrderId)
            .HasColumnName("order_id")
            .IsRequired();

        builder.Property(oi => oi.ProductVariantId)
            .HasColumnName("product_variant_id")
            .IsRequired();

        builder.Property(oi => oi.Quantity)
            .HasColumnName("quantity")
            .IsRequired();

        builder.Property(oi => oi.UnitPrice)
            .HasColumnName("unit_price")
            .IsRequired()
            .HasColumnType("numeric(12,2)");

        builder.Property(oi => oi.LineTotal)
            .HasColumnName("line_total")
            .IsRequired()
            .HasColumnType("numeric(12,2)");

        builder.HasOne(oi => oi.Order)
            .WithMany(o => o.Items)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(oi => oi.ProductVariant)
            .WithMany()
            .HasForeignKey(oi => oi.ProductVariantId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
