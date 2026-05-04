namespace blooming_api.Modules.Products.DTOs;

public class SizeSystemResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public List<SizeResponse> Sizes { get; set; } = new();
}

public class SizeResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public decimal SortOrder { get; set; }
    public string? Description { get; set; }
}
