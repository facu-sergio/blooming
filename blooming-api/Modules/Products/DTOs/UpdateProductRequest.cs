namespace blooming_api.Modules.Products.DTOs;

public class UpdateProductRequest
{
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public IFormFile? Image { get; set; }
    public bool RemoveImage { get; set; }
    public string Variants { get; set; } = string.Empty; // JSON string de List<UpdateVariantDto>
    public List<IFormFile>? VariantImages { get; set; }
}

public class UpdateVariantDto
{
    public int? Id { get; set; }
    public int SizeId { get; set; }
    public int ColorId { get; set; }
    public decimal CostPrice { get; set; }
    public decimal MarkupPercentage { get; set; }
    public int? LowStockThreshold { get; set; }
    public bool RemoveVariantImage { get; set; }
    public List<MeasurementDto>? Measurements { get; set; }
}
