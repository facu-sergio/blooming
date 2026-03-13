namespace blooming_api.Modules.Products.DTOs;

public class UpdateProductRequest
{
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public IFormFile? Image { get; set; }
    public bool RemoveImage { get; set; }
    public string Variants { get; set; } = string.Empty; // JSON string de List<UpdateVariantDto>
}

public class UpdateVariantDto
{
    public int? Id { get; set; }
    public string Size { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public decimal CostPrice { get; set; }
    public decimal MarkupPercentage { get; set; }
}
