using blooming_api.Modules.Suppliers;
using blooming_api.Modules.Suppliers.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace blooming_api.Infrastructure.Data.Configurations;

public class SupplierConfiguration : IEntityTypeConfiguration<Supplier>
{
    public void Configure(EntityTypeBuilder<Supplier> builder)
    {
        builder.ToTable("suppliers");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasColumnName("id").ValueGeneratedNever();
        builder.Property(s => s.Name)
            .HasColumnName("name")
            .IsRequired()
            .HasMaxLength(SuppliersConstants.NameMaxLength);
        builder.Property(s => s.Phone)
            .HasColumnName("phone")
            .HasMaxLength(SuppliersConstants.PhoneMaxLength);
        builder.Property(s => s.Website)
            .HasColumnName("website")
            .HasMaxLength(SuppliersConstants.WebsiteMaxLength);
        builder.Property(s => s.Address)
            .HasColumnName("address")
            .HasMaxLength(SuppliersConstants.AddressMaxLength);
        builder.Property(s => s.Notes)
            .HasColumnName("notes")
            .HasMaxLength(SuppliersConstants.NotesMaxLength);
        builder.Property(s => s.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(s => s.UpdatedAt).HasColumnName("updated_at").IsRequired();

        builder.HasIndex(s => s.Name).HasDatabaseName("idx_suppliers_name");
    }
}
