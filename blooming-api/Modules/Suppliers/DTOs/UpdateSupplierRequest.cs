namespace blooming_api.Modules.Suppliers.DTOs;

public class UpdateSupplierRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Website { get; set; }
    public string? Address { get; set; }
    public string? Notes { get; set; }
}
