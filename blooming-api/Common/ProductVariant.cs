namespace blooming_api.Common;

public class ProductVariant
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string Size { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public decimal CostPrice { get; set; }
    public decimal MarkupPercentage { get; set; }
    public decimal SellingPrice { get; set; }
    public int Stock { get; set; }
    public int? LowStockThreshold { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Product Product { get; set; } = null!;
}
