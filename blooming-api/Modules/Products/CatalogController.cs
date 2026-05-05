using blooming_api.Modules.Products.Commands.CreateColor;
using blooming_api.Modules.Products.Commands.ToggleColorActive;
using blooming_api.Modules.Products.Commands.UpdateColor;
using blooming_api.Modules.Products.DTOs;
using blooming_api.Modules.Products.Queries.GetColors;
using blooming_api.Modules.Products.Queries.GetColorsAdmin;
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

    [HttpGet("api/colors/admin")]
    public async Task<ActionResult<List<ColorAdminResponse>>> GetColorsAdmin()
    {
        var result = await _mediator.Send(new GetColorsAdminQuery());
        return Ok(result);
    }

    [HttpPost("api/colors")]
    public async Task<ActionResult<ColorAdminResponse>> CreateColor([FromBody] CreateColorCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetColorsAdmin), new { }, result);
    }

    [HttpPut("api/colors/{id:int}")]
    public async Task<ActionResult<ColorAdminResponse>> UpdateColor(int id, [FromBody] UpdateColorRequest request)
    {
        var result = await _mediator.Send(new UpdateColorCommand(id, request.Name, request.DisplayName, request.SortOrder));
        return Ok(result);
    }

    [HttpPatch("api/colors/{id:int}/toggle-active")]
    public async Task<ActionResult<ColorAdminResponse>> ToggleColorActive(int id)
    {
        var result = await _mediator.Send(new ToggleColorActiveCommand(id));
        return Ok(result);
    }

    [HttpGet("api/size-systems")]
    public async Task<ActionResult<List<SizeSystemResponse>>> GetSizeSystems()
    {
        var result = await _mediator.Send(new GetSizeSystemsQuery());
        return Ok(result);
    }
}
