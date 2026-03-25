using System.Security.Claims;
using blooming_api.Modules.Orders.Commands.ConfirmOrder;
using blooming_api.Modules.Orders.Commands.CreateOrder;
using blooming_api.Modules.Orders.DTOs;
using blooming_api.Modules.Orders.Queries.GetOrderDetail;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace blooming_api.Modules.Orders.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult<CreateOrderResult>> Create([FromBody] CreateOrderRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var command = new CreateOrderCommand(
            request.CustomerId,
            request.Items.Select(i => new OrderItemDto(i.ProductVariantId, i.Quantity)).ToList(),
            request.ShippingAddress,
            request.Notes,
            request.EstimatedDeliveryDate,
            userId
        );

        var result = await _mediator.Send(command);
        return StatusCode(201, result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderDetailDto>> GetDetail(int id)
    {
        var result = await _mediator.Send(new GetOrderDetailQuery(id));
        return Ok(result);
    }

    [HttpPost("{id:int}/confirm")]
    public async Task<ActionResult<ConfirmOrderResult>> ConfirmOrder(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var result = await _mediator.Send(new ConfirmOrderCommand(id, userId));
        return Ok(result);
    }
}
