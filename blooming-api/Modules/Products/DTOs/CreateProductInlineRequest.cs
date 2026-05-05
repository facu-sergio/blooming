namespace blooming_api.Modules.Products.DTOs;

public class CreateProductInlineRequest
{
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public int SizeId { get; set; }
    public int ColorId { get; set; }
    public decimal MarkupPercentage { get; set; }
    public int? LowStockThreshold { get; set; }
}
