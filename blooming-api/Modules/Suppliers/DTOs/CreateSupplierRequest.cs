namespace blooming_api.Modules.Suppliers.DTOs;

public class CreateSupplierRequest
{
    public string Name { get; set; } = string.Empty;
    public string? ContactInfo { get; set; }
    public string? Notes { get; set; }
}
