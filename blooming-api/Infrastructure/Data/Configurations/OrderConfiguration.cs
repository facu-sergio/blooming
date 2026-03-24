using blooming_api.Modules.Orders.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace blooming_api.Infrastructure.Data.Configurations;

/// <summary>
/// Configuración EF Core para la entidad Order.
///
/// [STUB - Historia 3.3] Campos mínimos para historial de cliente.
/// Epic 4 debe agregar configuración para OrderItems y campos adicionales.
/// </summary>
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

        builder.Property(o => o.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(o => o.UpdatedAt)
            .HasColumnName("updated_at");

        // Relación Customer → Orders (one-to-many)
        // Epic 4: si se agrega cascade delete, considerar el impacto en el historial
        builder.HasOne(o => o.Customer)
            .WithMany()
            .HasForeignKey(o => o.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
