using MediatR;

namespace blooming_api.Modules.Dashboard.Queries.GetActiveStockAlerts;

public record GetActiveStockAlertsQuery() : IRequest<List<StockAlertDto>>;

public record StockAlertDto(string ProductName, string Size, string Color, int CurrentStock, int Threshold);
