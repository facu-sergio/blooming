using blooming_api.Modules.Suppliers.Commands.CreatePurchaseOrder;
using Xunit;

namespace blooming_api.Tests.Suppliers;

public class CreatePurchaseOrderValidatorTests
{
    private readonly CreatePurchaseOrderValidator _validator = new();

    [Fact]
    public void Validate_ComandoValido_PasaValidacion()
    {
        var command = new CreatePurchaseOrderCommand(
            Guid.NewGuid(),
            new List<CreatePurchaseOrderItemDto> { new(1, 5, 1000m) },
            null
        );

        var result = _validator.Validate(command);

        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_SinProveedor_FallaValidacion()
    {
        var command = new CreatePurchaseOrderCommand(
            Guid.Empty,
            new List<CreatePurchaseOrderItemDto> { new(1, 5, 1000m) },
            null
        );

        var result = _validator.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "SupplierId");
    }

    [Fact]
    public void Validate_SinItems_FallaValidacion()
    {
        var command = new CreatePurchaseOrderCommand(
            Guid.NewGuid(),
            new List<CreatePurchaseOrderItemDto>(),
            null
        );

        var result = _validator.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "Items");
    }

    [Fact]
    public void Validate_ItemCantidadCero_FallaValidacion()
    {
        var command = new CreatePurchaseOrderCommand(
            Guid.NewGuid(),
            new List<CreatePurchaseOrderItemDto> { new(1, 0, 1000m) },
            null
        );

        var result = _validator.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName.Contains("Quantity"));
    }

    [Fact]
    public void Validate_ItemPrecioCero_FallaValidacion()
    {
        var command = new CreatePurchaseOrderCommand(
            Guid.NewGuid(),
            new List<CreatePurchaseOrderItemDto> { new(1, 5, 0m) },
            null
        );

        var result = _validator.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName.Contains("UnitCostPrice"));
    }

    [Fact]
    public void Validate_ItemVarianteIdCero_FallaValidacion()
    {
        var command = new CreatePurchaseOrderCommand(
            Guid.NewGuid(),
            new List<CreatePurchaseOrderItemDto> { new(0, 5, 1000m) },
            null
        );

        var result = _validator.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName.Contains("ProductVariantId"));
    }
}
