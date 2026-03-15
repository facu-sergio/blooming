namespace blooming_api.Modules.Products.DTOs;

public class SearchProductsRequest
{
    public string? SearchTerm { get; set; }
    public string? Category { get; set; }
    public string? Size { get; set; }
    public string? Color { get; set; }
}
