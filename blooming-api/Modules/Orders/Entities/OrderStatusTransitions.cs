namespace blooming_api.Modules.Orders.Entities;

/// <summary>
/// Máquina de estados del pedido.
/// Define las transiciones válidas entre estados y provee mensajes de error descriptivos.
/// </summary>
public static class OrderStatusTransitions
{
    private static readonly Dictionary<OrderStatus, OrderStatus[]> ValidTransitions = new()
    {
        { OrderStatus.Pending,   new[] { OrderStatus.Confirmed, OrderStatus.Cancelled } },
        { OrderStatus.Confirmed, new[] { OrderStatus.Shipped, OrderStatus.Delivered, OrderStatus.Cancelled } },
        { OrderStatus.Shipped,   new[] { OrderStatus.Delivered, OrderStatus.Cancelled } },
        { OrderStatus.Delivered, Array.Empty<OrderStatus>() },
        { OrderStatus.Cancelled, Array.Empty<OrderStatus>() },
    };

    public static bool IsValidTransition(OrderStatus from, OrderStatus to)
        => ValidTransitions.TryGetValue(from, out var valid) && valid.Contains(to);

    public static OrderStatus[] GetValidTransitions(OrderStatus current)
        => ValidTransitions.TryGetValue(current, out var valid) ? valid : Array.Empty<OrderStatus>();

    public static string GetTransitionErrorMessage(OrderStatus from, OrderStatus to)
        => $"No se puede cambiar el estado de {MapToSpanish(from)} a {MapToSpanish(to)}. " +
           $"Estados válidos desde {MapToSpanish(from)}: {FormatValidTargets(from)}.";

    private static string FormatValidTargets(OrderStatus from)
    {
        var targets = GetValidTransitions(from);
        return targets.Length == 0
            ? "ninguno (estado final)"
            : string.Join(", ", targets.Select(MapToSpanish));
    }

    internal static string MapToSpanish(OrderStatus status) => status switch
    {
        OrderStatus.Pending   => "Pendiente",
        OrderStatus.Confirmed => "Confirmado",
        OrderStatus.Shipped   => "Enviado",
        OrderStatus.Delivered => "Entregado",
        OrderStatus.Cancelled => "Cancelado",
        _                     => status.ToString()
    };
}
