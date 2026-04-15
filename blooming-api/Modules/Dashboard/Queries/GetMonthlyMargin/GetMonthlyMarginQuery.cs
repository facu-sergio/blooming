using MediatR;

namespace blooming_api.Modules.Dashboard.Queries.GetMonthlyMargin;

public record GetMonthlyMarginQuery() : IRequest<MonthlyMarginDto>;

public record MonthlyMarginDto(decimal Revenue, decimal Cost, decimal Margin);
