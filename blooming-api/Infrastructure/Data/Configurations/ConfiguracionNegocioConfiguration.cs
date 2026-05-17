using blooming_api.Modules.Configuracion.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace blooming_api.Infrastructure.Data.Configurations;

public class ConfiguracionNegocioConfiguration : IEntityTypeConfiguration<ConfiguracionNegocio>
{
    public void Configure(EntityTypeBuilder<ConfiguracionNegocio> builder)
    {
        builder.ToTable("configuracion_negocio");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasColumnName("id").ValueGeneratedNever();
        builder.Property(c => c.SaldoFondo)
            .HasColumnName("saldo_fondo")
            .HasColumnType("numeric(12,2)")
            .IsRequired();
        builder.Property(c => c.UpdatedAt).HasColumnName("updated_at").IsRequired();
    }
}
