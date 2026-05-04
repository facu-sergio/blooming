using blooming_api.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace blooming_api.Infrastructure.Data.Configurations;

public class ColorConfiguration : IEntityTypeConfiguration<Color>
{
    public void Configure(EntityTypeBuilder<Color> builder)
    {
        builder.ToTable("colors");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(c => c.Name).HasColumnName("name").IsRequired().HasMaxLength(50);
        builder.Property(c => c.DisplayName).HasColumnName("display_name").IsRequired().HasMaxLength(100);
        builder.Property(c => c.SortOrder).HasColumnName("sort_order").HasColumnType("decimal(5,1)").IsRequired();
        builder.Property(c => c.IsActive).HasColumnName("is_active").HasDefaultValue(true).IsRequired();
        builder.HasIndex(c => c.Name).IsUnique();
    }
}
