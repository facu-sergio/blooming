namespace blooming_api.Common;

public class ProductVariantMeasurement
{
    public int Id { get; set; }
    public int ProductVariantId { get; set; }
    public string MeasurementName { get; set; } = string.Empty;
    public decimal ValueInCm { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public ProductVariant ProductVariant { get; set; } = null!;
}
