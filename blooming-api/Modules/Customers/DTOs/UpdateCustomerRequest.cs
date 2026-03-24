namespace blooming_api.Modules.Customers.DTOs;

public class UpdateCustomerRequest
{
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Notes { get; set; }
}
