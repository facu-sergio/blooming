using blooming_api.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace blooming_api.Infrastructure.Data.Configurations;

public class SizeSystemConfiguration : IEntityTypeConfiguration<SizeSystem>
{
    public void Configure(EntityTypeBuilder<SizeSystem> builder)
    {
        builder.ToTable("size_systems");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(s => s.Name).HasColumnName("name").IsRequired().HasMaxLength(50);
        builder.Property(s => s.DisplayName).HasColumnName("display_name").IsRequired().HasMaxLength(100);
        builder.Property(s => s.SortOrder).HasColumnName("sort_order").HasColumnType("decimal(5,1)").IsRequired();
        builder.Property(s => s.IsActive).HasColumnName("is_active").HasDefaultValue(true).IsRequired();
        builder.HasIndex(s => s.Name).IsUnique();
        builder.HasMany(s => s.Sizes)
            .WithOne(sz => sz.SizeSystem)
            .HasForeignKey(sz => sz.SizeSystemId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
