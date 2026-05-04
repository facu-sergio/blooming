namespace blooming_api.Modules.Products.DTOs;

public class SearchProductsRequest
{
    public string? SearchTerm { get; set; }
    public string? Category { get; set; }
    public int? SizeId { get; set; }
    public int? ColorId { get; set; }
}
