namespace blooming_api.Modules.Products.DTOs;

public class CreateProductRequest
{
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public IFormFile? Image { get; set; }
    public string Variants { get; set; } = string.Empty; // JSON string de List<CreateVariantDto>
}

public class CreateVariantDto
{
    public string Size { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public decimal CostPrice { get; set; }
    public decimal MarkupPercentage { get; set; }
    public int? LowStockThreshold { get; set; }
    public List<MeasurementDto>? Measurements { get; set; }
}

public class MeasurementDto
{
    public string Name { get; set; } = string.Empty;
    public decimal ValueInCm { get; set; }
}
