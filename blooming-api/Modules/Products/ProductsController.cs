using System.Text.Json;
using blooming_api.Modules.Products.Commands.CreateProduct;
using blooming_api.Modules.Products.Commands.UpdateProduct;
using blooming_api.Modules.Products.DTOs;
using blooming_api.Modules.Products.Queries.GetProductDetail;
using blooming_api.Modules.Products.Queries.GetProducts;
using blooming_api.Modules.Products.Queries.GetStockMovements;
using blooming_api.Modules.Products.Queries.SearchProducts;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace blooming_api.Modules.Products;

[ApiController]
[Route("api/products")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProductResponse>>> GetAll()
    {
        var result = await _mediator.Send(new GetProductsQuery());
        return Ok(result);
    }

    [HttpGet("search")]
    public async Task<ActionResult<List<ProductResponse>>> Search(
        [FromQuery] string? searchTerm,
        [FromQuery] string? category,
        [FromQuery] string? size,
        [FromQuery] string? color)
    {
        var request = new SearchProductsRequest
        {
            SearchTerm = searchTerm,
            Category = category,
            Size = size,
            Color = color
        };
        var result = await _mediator.Send(new SearchProductsQuery(request));
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductResponse>> GetById(int id)
    {
        var result = await _mediator.Send(new GetProductDetailQuery(id));
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ProductResponse>> Create([FromForm] CreateProductRequest request)
    {
        var variants = JsonSerializer.Deserialize<List<CreateVariantDto>>(request.Variants,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? [];

        var command = new CreateProductCommand(request.Name, request.CategoryId, request.Image, variants);
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet("variants/{variantId}/stock-movements")]
    public async Task<ActionResult<StockMovementListResponse>> GetStockMovements(
        int variantId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetStockMovementsQuery(variantId, pageNumber, pageSize));
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ProductResponse>> Update(int id, [FromForm] UpdateProductRequest request)
    {
        var variants = JsonSerializer.Deserialize<List<UpdateVariantDto>>(request.Variants,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? [];

        var command = new UpdateProductCommand(id, request.Name, request.CategoryId, request.Image, request.RemoveImage, variants);
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}
