using blooming_api.Modules.Products.DTOs;
using blooming_api.Modules.Products.Queries.GetColors;
using blooming_api.Modules.Products.Queries.GetSizeSystems;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace blooming_api.Modules.Products;

[ApiController]
[Authorize]
public class CatalogController : ControllerBase
{
    private readonly IMediator _mediator;

    public CatalogController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("api/colors")]
    public async Task<ActionResult<List<ColorResponse>>> GetColors()
    {
        var result = await _mediator.Send(new GetColorsQuery());
        return Ok(result);
    }

    [HttpGet("api/size-systems")]
    public async Task<ActionResult<List<SizeSystemResponse>>> GetSizeSystems()
    {
        var result = await _mediator.Send(new GetSizeSystemsQuery());
        return Ok(result);
    }

}
