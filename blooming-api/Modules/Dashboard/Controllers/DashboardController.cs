using blooming_api.Modules.Dashboard.Queries.GetActiveStockAlerts;
using blooming_api.Modules.Dashboard.Queries.GetDailySalesMetrics;
using blooming_api.Modules.Dashboard.Queries.GetMonthlyMargin;
using blooming_api.Modules.Dashboard.Queries.GetMonthlySalesMetrics;
using blooming_api.Modules.Dashboard.Queries.GetTopProducts;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace blooming_api.Modules.Dashboard.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IMediator _mediator;

    public DashboardController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("daily-sales")]
    public async Task<ActionResult<DailySalesMetricsDto>> GetDailySales()
    {
        var result = await _mediator.Send(new GetDailySalesMetricsQuery());
        return Ok(result);
    }

    [HttpGet("monthly-sales")]
    public async Task<ActionResult<MonthlySalesMetricsDto>> GetMonthlySales()
    {
        var result = await _mediator.Send(new GetMonthlySalesMetricsQuery());
        return Ok(result);
    }

    [HttpGet("top-products")]
    public async Task<ActionResult<List<TopProductDto>>> GetTopProducts()
    {
        var result = await _mediator.Send(new GetTopProductsQuery());
        return Ok(result);
    }

    [HttpGet("stock-alerts")]
    public async Task<ActionResult<List<StockAlertDto>>> GetStockAlerts()
    {
        var result = await _mediator.Send(new GetActiveStockAlertsQuery());
        return Ok(result);
    }

    [HttpGet("monthly-margin")]
    public async Task<ActionResult<MonthlyMarginDto>> GetMonthlyMargin()
    {
        var result = await _mediator.Send(new GetMonthlyMarginQuery());
        return Ok(result);
    }
}
