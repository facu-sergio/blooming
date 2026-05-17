using MediatR;

namespace blooming_api.Modules.Dashboard.Queries.GetFondoReposicion;

public record GetFondoReposicionQuery() : IRequest<FondoReposicionDto>;
