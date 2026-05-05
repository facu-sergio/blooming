namespace blooming_api.Modules.Products.DTOs;

public class UpdateColorRequest
{
    public string? Name { get; set; }
    public string? DisplayName { get; set; }
    public decimal? SortOrder { get; set; }
}
