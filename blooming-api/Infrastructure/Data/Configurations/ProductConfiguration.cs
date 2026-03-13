using blooming_api.Common;
using blooming_api.Modules.Products;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace blooming_api.Infrastructure.Data.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(p => p.Name).HasColumnName("name").IsRequired().HasMaxLength(ProductsConstants.NameMaxLength);
        builder.Property(p => p.Category).HasColumnName("category").IsRequired().HasMaxLength(ProductsConstants.CategoryMaxLength);
        builder.Property(p => p.ImageUrl).HasColumnName("image_url").HasMaxLength(500);
        builder.Property(p => p.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(p => p.UpdatedAt).HasColumnName("updated_at");
    }
}
