namespace blooming_api.Common;

public class ProductVariant
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int SizeId { get; set; }
    public Size Size { get; set; } = null!;
    public int ColorId { get; set; }
    public Color Color { get; set; } = null!;
    public decimal CostPrice { get; set; }
    public decimal MarkupPercentage { get; set; }
    public decimal SellingPrice { get; set; }
    public int Stock { get; set; }
    public int? LowStockThreshold { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Product Product { get; set; } = null!;
    public List<ProductVariantMeasurement> Measurements { get; set; } = new();
}
