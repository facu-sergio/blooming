namespace blooming_api.Common;

public class Color
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public decimal SortOrder { get; set; }
    public bool IsActive { get; set; }
}
