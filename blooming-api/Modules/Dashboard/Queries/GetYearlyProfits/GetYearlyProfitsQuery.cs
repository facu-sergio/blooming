using MediatR;

namespace blooming_api.Modules.Dashboard.Queries.GetYearlyProfits;

public record GetYearlyProfitsQuery() : IRequest<YearlyProfitsDto>;

public record YearlyProfitsDto(int OrderCount, decimal TotalProfit);
