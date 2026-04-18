using MediatR;

namespace blooming_api.Modules.Products.Queries.GetPriceHistory;

public record GetPriceHistoryQuery(int ProductVariantId) : IRequest<List<PriceHistoryItemDto>>;

public class PriceHistoryItemDto
{
    public int Id { get; set; }
    public decimal CostPrice { get; set; }
    public decimal SellingPrice { get; set; }
    public decimal MarkupPercentage { get; set; }
    public int? PurchaseOrderId { get; set; }
    public DateTime CreatedAt { get; set; }
}
