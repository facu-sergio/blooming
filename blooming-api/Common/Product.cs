using blooming_api.Modules.Products.Entities;

namespace blooming_api.Common;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public int? SizeSystemId { get; set; }
    public SizeSystem? SizeSystem { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<ProductVariant> Variants { get; set; } = new();
}
