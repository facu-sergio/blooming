using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Suppliers.Commands.CreateSupplier;
using blooming_api.Modules.Suppliers;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace blooming_api.Tests.Suppliers;

public class CreateSupplierHandlerTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly CreateSupplierHandler _handler;
    private readonly CreateSupplierValidator _validator;

    public CreateSupplierHandlerTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _db = new AppDbContext(options);
        _handler = new CreateSupplierHandler(_db);
        _validator = new CreateSupplierValidator();
    }

    [Fact]
    public async Task Handle_NombreValido_CreaProveedorYRetornaResponse()
    {
        var command = new CreateSupplierCommand("Mayorista ABC", "011-4444-5555", "www.abc.com", "Av. Corrientes 1234", "Proveedor principal");

        var result = await _handler.Handle(command, CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.Equal("Mayorista ABC", result.Name);
        Assert.Equal("011-4444-5555", result.Phone);
        Assert.Equal("www.abc.com", result.Website);
        Assert.Equal("Av. Corrientes 1234", result.Address);
        Assert.Equal("Proveedor principal", result.Notes);
        Assert.True(result.CreatedAt > DateTime.MinValue);
        Assert.True(result.UpdatedAt > DateTime.MinValue);
    }

    [Fact]
    public async Task Handle_SoloNombre_CreaProveedorSinCamposOpcionales()
    {
        var command = new CreateSupplierCommand("Proveedor Sin Contacto", null, null, null, null);

        var result = await _handler.Handle(command, CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.Equal("Proveedor Sin Contacto", result.Name);
        Assert.Null(result.Phone);
        Assert.Null(result.Website);
        Assert.Null(result.Address);
        Assert.Null(result.Notes);
    }

    [Fact]
    public async Task Handle_GuardaEnBaseDeDatos()
    {
        var command = new CreateSupplierCommand("Proveedor DB", null, null, null, null);

        var result = await _handler.Handle(command, CancellationToken.None);

        var stored = await _db.Suppliers.FindAsync(result.Id);
        Assert.NotNull(stored);
        Assert.Equal("Proveedor DB", stored.Name);
    }

    [Fact]
    public async Task Handle_GeneraIdUnico_CadaVez()
    {
        var c1 = new CreateSupplierCommand("Proveedor 1", null, null, null, null);
        var c2 = new CreateSupplierCommand("Proveedor 2", null, null, null, null);

        var r1 = await _handler.Handle(c1, CancellationToken.None);
        var r2 = await _handler.Handle(c2, CancellationToken.None);

        Assert.NotEqual(r1.Id, r2.Id);
    }

    [Fact]
    public void Validate_NombreVacio_FallaValidacion()
    {
        var command = new CreateSupplierCommand("", null, null, null, null);

        var result = _validator.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "Name");
    }

    [Fact]
    public void Validate_NombreDemasiadoLargo_FallaValidacion()
    {
        var nombreLargo = new string('A', SuppliersConstants.NameMaxLength + 1);
        var command = new CreateSupplierCommand(nombreLargo, null, null, null, null);

        var result = _validator.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "Name");
    }

    [Fact]
    public void Validate_NombreMaximoPermitido_PasaValidacion()
    {
        var nombreJusto = new string('A', SuppliersConstants.NameMaxLength);
        var command = new CreateSupplierCommand(nombreJusto, null, null, null, null);

        var result = _validator.Validate(command);

        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_PhoneDemasiadoLargo_FallaValidacion()
    {
        var phoneLargo = new string('B', SuppliersConstants.PhoneMaxLength + 1);
        var command = new CreateSupplierCommand("Proveedor", phoneLargo, null, null, null);

        var result = _validator.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "Phone");
    }

    [Fact]
    public void Validate_NotasDemasiadoLargas_FallaValidacion()
    {
        var notasLargas = new string('C', SuppliersConstants.NotesMaxLength + 1);
        var command = new CreateSupplierCommand("Proveedor", null, null, null, notasLargas);

        var result = _validator.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "Notes");
    }

    public void Dispose() => _db.Dispose();
}
