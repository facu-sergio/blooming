namespace blooming_api.Modules.Products.DTOs;

public class ColorResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public decimal SortOrder { get; set; }
}
