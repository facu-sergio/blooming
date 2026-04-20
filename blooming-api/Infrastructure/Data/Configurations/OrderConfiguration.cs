using blooming_api.Modules.Orders.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace blooming_api.Infrastructure.Data.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders");
        builder.HasKey(o => o.Id);
        builder.Property(o => o.Id).HasColumnName("id").ValueGeneratedOnAdd();

        builder.Property(o => o.CustomerId)
            .HasColumnName("customer_id")
            .IsRequired();

        builder.Property(o => o.Status)
            .HasColumnName("status")
            .IsRequired()
            .HasConversion<int>();

        builder.Property(o => o.Total)
            .HasColumnName("total")
            .IsRequired()
            .HasColumnType("numeric(12,2)");

        builder.Property(o => o.Discount)
            .HasColumnName("discount")
            .HasColumnType("numeric(12,2)");

        builder.Property(o => o.ShippingAddress)
            .HasColumnName("shipping_address")
            .HasMaxLength(500);

        builder.Property(o => o.Notes)
            .HasColumnName("notes")
            .HasMaxLength(2000);

        builder.Property(o => o.EstimatedDeliveryDate)
            .HasColumnName("estimated_delivery_date");

        builder.Property(o => o.CreatedByUserId)
            .HasColumnName("created_by_user_id");

        builder.Property(o => o.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(o => o.UpdatedAt)
            .HasColumnName("updated_at");

        builder.Property(o => o.ConfirmedAt)
            .HasColumnName("confirmed_at");

        builder.Property(o => o.ShippedAt)
            .HasColumnName("shipped_at");

        builder.Property(o => o.DeliveredAt)
            .HasColumnName("delivered_at");

        builder.Property(o => o.CancelledAt)
            .HasColumnName("cancelled_at");

        builder.HasOne(o => o.Customer)
            .WithMany()
            .HasForeignKey(o => o.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
