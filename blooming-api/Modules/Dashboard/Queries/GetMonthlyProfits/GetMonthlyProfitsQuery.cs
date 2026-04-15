using MediatR;

namespace blooming_api.Modules.Dashboard.Queries.GetMonthlyProfits;

public record GetMonthlyProfitsQuery() : IRequest<MonthlyProfitsDto>;

public record MonthlyProfitsDto(int OrderCount, decimal TotalProfit);
