using blooming_api.Modules.Customers;
using blooming_api.Modules.Customers.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace blooming_api.Infrastructure.Data.Configurations;

public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("customers");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(c => c.Name)
            .HasColumnName("name")
            .IsRequired()
            .HasMaxLength(CustomersConstants.NameMaxLength);
        builder.Property(c => c.Phone)
            .HasColumnName("phone")
            .IsRequired()
            .HasMaxLength(CustomersConstants.PhoneMaxLength);
        builder.Property(c => c.Address)
            .HasColumnName("address")
            .HasMaxLength(CustomersConstants.AddressMaxLength);
        builder.Property(c => c.Notes)
            .HasColumnName("notes")
            .HasMaxLength(CustomersConstants.NotesMaxLength);
        builder.Property(c => c.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(c => c.UpdatedAt).HasColumnName("updated_at");
    }
}
