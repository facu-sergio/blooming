using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace blooming_api.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddFondoReposicionTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "auditoria_fondo_reposicion",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    saldo_anterior = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    saldo_nuevo = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    motivo = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    usuario_id = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_auditoria_fondo_reposicion", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "configuracion_negocio",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false),
                    saldo_fondo = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_configuracion_negocio", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "idx_auditoria_fondo_created_at",
                table: "auditoria_fondo_reposicion",
                column: "created_at");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "auditoria_fondo_reposicion");

            migrationBuilder.DropTable(
                name: "configuracion_negocio");
        }
    }
}
