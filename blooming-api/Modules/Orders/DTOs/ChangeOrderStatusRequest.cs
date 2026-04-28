namespace blooming_api.Modules.Orders.DTOs;

public class ChangeOrderStatusRequest
{
    public string NewStatus { get; set; } = string.Empty;
    public DateTime? DeliveredAt { get; set; }
}
