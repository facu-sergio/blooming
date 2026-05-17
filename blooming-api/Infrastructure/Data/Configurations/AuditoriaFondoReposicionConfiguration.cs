using blooming_api.Modules.Configuracion;
using blooming_api.Modules.Configuracion.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace blooming_api.Infrastructure.Data.Configurations;

public class AuditoriaFondoReposicionConfiguration : IEntityTypeConfiguration<AuditoriaFondoReposicion>
{
    public void Configure(EntityTypeBuilder<AuditoriaFondoReposicion> builder)
    {
        builder.ToTable("auditoria_fondo_reposicion");
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(a => a.SaldoAnterior)
            .HasColumnName("saldo_anterior")
            .HasColumnType("numeric(12,2)")
            .IsRequired();
        builder.Property(a => a.SaldoNuevo)
            .HasColumnName("saldo_nuevo")
            .HasColumnType("numeric(12,2)")
            .IsRequired();
        builder.Property(a => a.Motivo)
            .HasColumnName("motivo")
            .HasMaxLength(ConfiguracionConstants.MotivoMaxLength)
            .IsRequired();
        builder.Property(a => a.UsuarioId).HasColumnName("usuario_id");
        builder.Property(a => a.CreatedAt).HasColumnName("created_at").IsRequired();

        builder.HasIndex(a => a.CreatedAt).HasDatabaseName("idx_auditoria_fondo_created_at");
    }
}
