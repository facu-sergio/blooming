namespace blooming_api.Modules.Products.DTOs;

public class CreateProductInlineRequest
{
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string Size { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public decimal MarkupPercentage { get; set; }
    public int? LowStockThreshold { get; set; }
}
