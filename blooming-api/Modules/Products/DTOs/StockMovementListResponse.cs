namespace blooming_api.Modules.Products.DTOs;

public class StockMovementListResponse
{
    public List<StockMovementResponse> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}
