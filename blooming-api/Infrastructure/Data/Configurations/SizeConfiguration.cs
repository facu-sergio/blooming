using blooming_api.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace blooming_api.Infrastructure.Data.Configurations;

public class SizeConfiguration : IEntityTypeConfiguration<Size>
{
    public void Configure(EntityTypeBuilder<Size> builder)
    {
        builder.ToTable("sizes");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(s => s.SizeSystemId).HasColumnName("size_system_id").IsRequired();
        builder.Property(s => s.Name).HasColumnName("name").IsRequired().HasMaxLength(50);
        builder.Property(s => s.DisplayName).HasColumnName("display_name").IsRequired().HasMaxLength(100);
        builder.Property(s => s.SortOrder).HasColumnName("sort_order").HasColumnType("decimal(5,1)").IsRequired();
        builder.Property(s => s.Description).HasColumnName("description").HasMaxLength(255);
        builder.Property(s => s.IsActive).HasColumnName("is_active").HasDefaultValue(true).IsRequired();
        builder.HasIndex(s => new { s.SizeSystemId, s.Name }).IsUnique();
    }
}
