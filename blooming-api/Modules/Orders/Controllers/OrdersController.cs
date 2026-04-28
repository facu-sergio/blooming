using System.Security.Claims;
using blooming_api.Modules.Orders.Commands.ChangeOrderStatus;
using blooming_api.Modules.Orders.Commands.ConfirmOrder;
using blooming_api.Modules.Orders.Commands.CreateOrder;
using blooming_api.Modules.Orders.DTOs;
using blooming_api.Modules.Orders.Entities;
using blooming_api.Modules.Orders.Queries.GetOrderDetail;
using blooming_api.Modules.Orders.Queries.GetOrders;
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

    [HttpGet]
    public async Task<ActionResult<PagedOrdersResult>> GetList(
        [FromQuery] string? status,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] int? customerId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = OrdersConstants.DefaultPageSize)
    {
        var result = await _mediator.Send(new GetOrdersQuery(status, fromDate, toDate, customerId, page, pageSize));
        return Ok(result);
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

    [HttpPost("{id:int}/change-status")]
    public async Task<ActionResult<ChangeOrderStatusResult>> ChangeStatus(int id, [FromBody] ChangeOrderStatusRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var result = await _mediator.Send(new ChangeOrderStatusCommand(id, request.NewStatus, userId, request.DeliveredAt));
        return Ok(result);
    }

    [HttpPost("{id:int}/cancel")]
    public async Task<ActionResult<ChangeOrderStatusResult>> Cancel(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var result = await _mediator.Send(new ChangeOrderStatusCommand(id, nameof(OrderStatus.Cancelled), userId));
        return Ok(result);
    }
}
