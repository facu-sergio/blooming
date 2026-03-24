using blooming_api.Modules.Customers.Entities;

namespace blooming_api.Modules.Orders.Entities;

/// <summary>
/// Entidad mínima de Pedido creada en Historia 3.3 para soportar el historial
/// y métricas de clientes.
///
/// [STUB para Epic 4 - Gestión de Pedidos]
/// Esta entidad fue creada anticipadamente porque Historia 3.3 requiere consultas
/// cross-module (Customers → Orders). Epic 4 debe EXPANDIR esta entidad, no reemplazarla.
///
/// Campos que Epic 4 debe agregar:
/// - List&lt;OrderItem&gt; Items: líneas del pedido (producto, variante, cantidad, precio unitario)
/// - decimal? Discount: descuento aplicado al pedido
/// - string? ShippingAddress: dirección de envío
/// - string? Notes: notas del pedido
/// - DateTime? ShippedAt, DeliveredAt, CancelledAt: timestamps de transiciones de estado
/// - int? CreatedByUserId: usuario que creó el pedido
///
/// Lógica de negocio que Epic 4 debe implementar:
/// - Descuento de stock al confirmar (SOLO en ConfirmOrderHandler)
/// - Reversión de stock al cancelar (SOLO en CancelOrderHandler)
/// - Todas las operaciones de stock dentro de transacción EF Core
/// </summary>
public class Order
{
    public int Id { get; set; }

    /// <summary>FK al cliente dueño del pedido.</summary>
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    /// <summary>Estado actual del pedido. Ver OrderStatus enum.</summary>
    public OrderStatus Status { get; set; }

    /// <summary>
    /// Monto total del pedido en pesos.
    /// En Historia 3.3 se usa para calcular métricas del cliente.
    /// En Epic 4 debe calcularse a partir de los OrderItems (sum(cantidad * precio_unitario) - descuento).
    /// </summary>
    public decimal Total { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
