namespace blooming_api.Modules.Orders.Entities;

/// <summary>
/// Estados posibles de un pedido.
///
/// [STUB - Historia 3.3] Este enum fue creado como base mínima para soportar
/// el historial de pedidos del cliente. Epic 4 definirá la máquina de estados
/// completa y las transiciones permitidas entre estados.
///
/// Estados actuales:
/// - Pending: Pedido creado, pendiente de confirmación
/// - Confirmed: Pedido confirmado (descuenta stock)
/// - Shipped: Pedido enviado
/// - Delivered: Pedido entregado
/// - Cancelled: Pedido cancelado (revierte stock si fue confirmado)
/// </summary>
public enum OrderStatus
{
    Pending = 0,
    Confirmed = 1,
    Shipped = 2,
    Delivered = 3,
    Cancelled = 4
}
