using blooming_api.Modules.Suppliers.Commands.CreateSupplier;
using blooming_api.Modules.Suppliers.Commands.UpdateSupplier;
using blooming_api.Modules.Suppliers.DTOs;
using blooming_api.Modules.Suppliers.Queries.GetSupplierById;
using blooming_api.Modules.Suppliers.Queries.GetSuppliers;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace blooming_api.Modules.Suppliers.Controllers;

[ApiController]
[Route("api/suppliers")]
[Authorize]
public class SuppliersController : ControllerBase
{
    private readonly IMediator _mediator;

    public SuppliersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<PagedSuppliersResult>> GetAll(
        [FromQuery] string? searchTerm,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 1000)
    {
        var result = await _mediator.Send(new GetSuppliersQuery(searchTerm, page, pageSize));
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SupplierResponse>> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetSupplierByIdQuery(id));
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<SupplierResponse>> Create([FromBody] CreateSupplierRequest request)
    {
        var command = new CreateSupplierCommand(request.Name, request.Phone, request.Website, request.Address, request.Notes);
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<SupplierResponse>> Update(Guid id, [FromBody] UpdateSupplierRequest request)
    {
        var command = new UpdateSupplierCommand(id, request.Name, request.Phone, request.Website, request.Address, request.Notes);
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}
