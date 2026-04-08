using blooming_api.Common.Exceptions;
using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Suppliers;
using blooming_api.Modules.Suppliers.Commands.UpdateSupplier;
using blooming_api.Modules.Suppliers.Entities;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace blooming_api.Tests.Suppliers;

public class UpdateSupplierHandlerTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly UpdateSupplierHandler _handler;
    private readonly UpdateSupplierValidator _validator;
    private readonly Guid _existingSupplierId;

    public UpdateSupplierHandlerTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _db = new AppDbContext(options);
        _handler = new UpdateSupplierHandler(_db);
        _validator = new UpdateSupplierValidator();
        _existingSupplierId = SeedData();
    }

    private Guid SeedData()
    {
        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Name = "Proveedor Original",
            ContactInfo = "original@test.com",
            Notes = "Notas originales",
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow.AddDays(-1),
        };
        _db.Suppliers.Add(supplier);
        _db.SaveChanges();
        return supplier.Id;
    }

    [Fact]
    public async Task Handle_DatosValidos_ActualizaProveedor()
    {
        var command = new UpdateSupplierCommand(_existingSupplierId, "Proveedor Actualizado", "nuevo@test.com", "Nuevas notas");

        var result = await _handler.Handle(command, CancellationToken.None);

        Assert.Equal(_existingSupplierId, result.Id);
        Assert.Equal("Proveedor Actualizado", result.Name);
        Assert.Equal("nuevo@test.com", result.ContactInfo);
        Assert.Equal("Nuevas notas", result.Notes);
    }

    [Fact]
    public async Task Handle_ActualizaUpdatedAt()
    {
        var antesDeActualizar = DateTime.UtcNow.AddSeconds(-1);
        var command = new UpdateSupplierCommand(_existingSupplierId, "Proveedor Nuevo", null, null);

        var result = await _handler.Handle(command, CancellationToken.None);

        Assert.True(result.UpdatedAt >= antesDeActualizar);
    }

    [Fact]
    public async Task Handle_PersisteCambiosEnDB()
    {
        var command = new UpdateSupplierCommand(_existingSupplierId, "Nombre Persistido", null, null);

        await _handler.Handle(command, CancellationToken.None);

        var stored = await _db.Suppliers.FindAsync(_existingSupplierId);
        Assert.NotNull(stored);
        Assert.Equal("Nombre Persistido", stored.Name);
    }

    [Fact]
    public async Task Handle_ProveedorInexistente_LanzaNotFoundException()
    {
        var idInexistente = Guid.NewGuid();
        var command = new UpdateSupplierCommand(idInexistente, "Nombre", null, null);

        await Assert.ThrowsAsync<NotFoundException>(() => _handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public void Validate_IdVacio_FallaValidacion()
    {
        var command = new UpdateSupplierCommand(Guid.Empty, "Nombre", null, null);

        var result = _validator.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "SupplierId");
    }

    [Fact]
    public void Validate_NombreVacio_FallaValidacion()
    {
        var command = new UpdateSupplierCommand(_existingSupplierId, "", null, null);

        var result = _validator.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "Name");
    }

    [Fact]
    public void Validate_NombreDemasiadoLargo_FallaValidacion()
    {
        var nombreLargo = new string('A', SuppliersConstants.NameMaxLength + 1);
        var command = new UpdateSupplierCommand(_existingSupplierId, nombreLargo, null, null);

        var result = _validator.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "Name");
    }

    [Fact]
    public void Validate_DatosValidos_PasaValidacion()
    {
        var command = new UpdateSupplierCommand(_existingSupplierId, "Nombre Válido", "contacto@ok.com", null);

        var result = _validator.Validate(command);

        Assert.True(result.IsValid);
    }

    public void Dispose() => _db.Dispose();
}
