namespace blooming_api.Modules.Products.DTOs;

public class ProductResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<VariantResponse> Variants { get; set; } = new();
}

public class VariantResponse
{
    public int Id { get; set; }
    public string Size { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public decimal CostPrice { get; set; }
    public decimal MarkupPercentage { get; set; }
    public decimal SellingPrice { get; set; }
    public int Stock { get; set; }
    public List<MeasurementResponse> Measurements { get; set; } = new();
}

public class MeasurementResponse
{
    public string Name { get; set; } = string.Empty;
    public decimal ValueInCm { get; set; }
}
