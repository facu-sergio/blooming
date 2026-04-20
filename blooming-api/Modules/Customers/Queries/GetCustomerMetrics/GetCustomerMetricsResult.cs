namespace blooming_api.Modules.Customers.Queries.GetCustomerMetrics;

/// <summary>
/// Métricas resumidas de un cliente.
///
/// [Historia 3.3] Métricas básicas para perfil de cliente.
/// Epic 4: considerar agregar más métricas como ticket promedio,
/// frecuencia de compra, última fecha de pedido, etc.
/// </summary>
public class GetCustomerMetricsResult
{
    /// <summary>Cantidad total de pedidos del cliente (todos los estados).</summary>
    public int TotalOrders { get; set; }

    /// <summary>
    /// Suma de totales de pedidos NO cancelados.
    /// Los pedidos en estado Cancelled se excluyen del monto gastado
    /// ya que no generaron facturación efectiva.
    /// </summary>
    public decimal TotalSpent { get; set; }
}
