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
        builder.Property(s => s.ContactInfo)
            .HasColumnName("contact_info")
            .HasMaxLength(SuppliersConstants.ContactInfoMaxLength);
        builder.Property(s => s.Notes)
            .HasColumnName("notes")
            .HasMaxLength(SuppliersConstants.NotesMaxLength);
        builder.Property(s => s.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(s => s.UpdatedAt).HasColumnName("updated_at").IsRequired();

        builder.HasIndex(s => s.Name).HasDatabaseName("idx_suppliers_name");
    }
}
