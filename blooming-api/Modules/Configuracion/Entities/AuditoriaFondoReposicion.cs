namespace blooming_api.Modules.Configuracion.Entities;

public class AuditoriaFondoReposicion
{
    public int Id { get; set; }
    public decimal SaldoAnterior { get; set; }
    public decimal SaldoNuevo { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public int? UsuarioId { get; set; }
    public DateTime CreatedAt { get; set; }
}
