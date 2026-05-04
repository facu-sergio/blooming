namespace blooming_api.Modules.Products.DTOs;

public class ProductResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int? SizeSystemId { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<VariantResponse> Variants { get; set; } = new();
}

public class VariantResponse
{
    public int Id { get; set; }
    public int SizeId { get; set; }
    public string SizeName { get; set; } = string.Empty;
    public string? SizeDescription { get; set; }
    public int ColorId { get; set; }
    public string ColorName { get; set; } = string.Empty;
    public decimal CostPrice { get; set; }
    public decimal MarkupPercentage { get; set; }
    public decimal SellingPrice { get; set; }
    public int Stock { get; set; }
    public int? LowStockThreshold { get; set; }
    public string? ImageUrl { get; set; }
    public List<MeasurementResponse> Measurements { get; set; } = new();
}

public class MeasurementResponse
{
    public string Name { get; set; } = string.Empty;
    public decimal ValueInCm { get; set; }
}
