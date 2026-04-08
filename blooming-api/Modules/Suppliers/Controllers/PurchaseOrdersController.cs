using blooming_api.Modules.Suppliers.Commands.CreatePurchaseOrder;
using blooming_api.Modules.Suppliers.DTOs;
using blooming_api.Modules.Suppliers.Queries.GetPurchaseOrderDetail;
using blooming_api.Modules.Suppliers.Queries.GetPurchaseOrders;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace blooming_api.Modules.Suppliers.Controllers;

[ApiController]
[Route("api/purchase-orders")]
[Authorize]
public class PurchaseOrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public PurchaseOrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<PurchaseOrderListItemDto>>> GetAll([FromQuery] Guid? supplierId)
    {
        var result = await _mediator.Send(new GetPurchaseOrdersQuery(supplierId));
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PurchaseOrderDetailDto>> GetById(int id)
    {
        var result = await _mediator.Send(new GetPurchaseOrderDetailQuery(id));
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<CreatePurchaseOrderResult>> Create([FromBody] CreatePurchaseOrderRequest request)
    {
        var command = new CreatePurchaseOrderCommand(
            request.SupplierId,
            request.Items.Select(i => new CreatePurchaseOrderItemDto(
                i.ProductVariantId,
                i.Quantity,
                i.UnitCostPrice
            )).ToList(),
            request.OrderDate
        );

        var result = await _mediator.Send(command);
        return StatusCode(201, result);
    }
}
