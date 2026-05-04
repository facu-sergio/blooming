namespace blooming_api.Common;

public class Size
{
    public int Id { get; set; }
    public int SizeSystemId { get; set; }
    public SizeSystem SizeSystem { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public decimal SortOrder { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
}
