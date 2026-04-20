using MediatR;

namespace blooming_api.Modules.Dashboard.Queries.GetTopProducts;

public record GetTopProductsQuery() : IRequest<List<TopProductDto>>;

public record TopProductDto(string ProductName, string? ImageUrl, int UnitsSold);
