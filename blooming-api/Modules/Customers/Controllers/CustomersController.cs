using blooming_api.Modules.Customers.Commands.CreateCustomer;
using blooming_api.Modules.Customers.Commands.UpdateCustomer;
using blooming_api.Modules.Customers.DTOs;
using blooming_api.Modules.Customers.Queries.GetCustomers;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace blooming_api.Modules.Customers.Controllers;

[ApiController]
[Route("api/customers")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly IMediator _mediator;

    public CustomersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<CustomerResponse>>> GetAll([FromQuery] string? searchTerm)
    {
        var result = await _mediator.Send(new GetCustomersQuery(searchTerm));
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<CustomerResponse>> Create([FromBody] CreateCustomerRequest request)
    {
        var command = new CreateCustomerCommand(request.Name, request.Phone, request.Address, request.Notes);
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetAll), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CustomerResponse>> Update(int id, [FromBody] UpdateCustomerRequest request)
    {
        var command = new UpdateCustomerCommand(id, request.Name, request.Phone, request.Address, request.Notes);
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}
