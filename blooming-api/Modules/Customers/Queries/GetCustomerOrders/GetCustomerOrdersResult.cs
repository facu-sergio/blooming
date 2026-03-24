namespace blooming_api.Modules.Customers.Queries.GetCustomerOrders;

/// <summary>
/// Representa un pedido en el historial de un cliente.
///
/// [Historia 3.3] Campos mínimos para la vista de historial.
/// Epic 4: considerar agregar campos como número de ítems, dirección de envío, etc.
/// </summary>
public class CustomerOrderSummary
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Nombre del estado en español para mostrar en la UI.
    /// Epic 4: revisar si conviene enviar el enum y que el frontend traduzca.
    /// </summary>
    public string Status { get; set; } = string.Empty;

    public decimal Total { get; set; }
}

public class GetCustomerOrdersResult
{
    public List<CustomerOrderSummary> Orders { get; set; } = [];
}
