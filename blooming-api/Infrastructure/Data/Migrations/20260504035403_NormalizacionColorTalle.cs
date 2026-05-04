using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace blooming_api.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class NormalizacionColorTalle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ── 1. Crear tablas catálogo ──────────────────────────────────────────
            migrationBuilder.CreateTable(
                name: "size_systems",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    display_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    sort_order = table.Column<decimal>(type: "numeric(5,1)", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_size_systems", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "colors",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    display_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    sort_order = table.Column<decimal>(type: "numeric(5,1)", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_colors", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "sizes",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    size_system_id = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    display_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    sort_order = table.Column<decimal>(type: "numeric(5,1)", nullable: false),
                    description = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sizes", x => x.id);
                    table.ForeignKey(
                        name: "FK_sizes_size_systems_size_system_id",
                        column: x => x.size_system_id,
                        principalTable: "size_systems",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_size_systems_name",
                table: "size_systems",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_colors_name",
                table: "colors",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_sizes_size_system_id_name",
                table: "sizes",
                columns: new[] { "size_system_id", "name" },
                unique: true);

            // ── 2. Extensión unaccent (normaliza tildes en comparaciones) ─────────
            migrationBuilder.Sql("CREATE EXTENSION IF NOT EXISTS unaccent;");

            // ── 3. Seed catálogo ──────────────────────────────────────────────────
            migrationBuilder.Sql(@"
                INSERT INTO size_systems (name, display_name, sort_order, is_active)
                VALUES ('ropa', 'Ropa', 1.0, true);
            ");

           migrationBuilder.Sql(@"
    INSERT INTO sizes (size_system_id, name, display_name, sort_order, description, is_active) VALUES
    -- Escala numérica chica
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '1', '1', 1.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '2', '2', 2.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '3', '3', 3.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '4', '4', 4.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '5', '5', 5.0, NULL, true),

    -- Talle único
    ((SELECT id FROM size_systems WHERE name = 'ropa'), 'unico', 'Único', 6.0, NULL, true),

    -- Talles alfabéticos
    ((SELECT id FROM size_systems WHERE name = 'ropa'), 'XS', 'XS', 10.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), 'S',  'S',  11.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), 'M',  'M',  12.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), 'L',  'L',  13.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), 'XL', 'XL', 14.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), 'XXL', 'XXL', 15.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), 'XXXL', 'XXXL', 16.0, NULL, true),

    -- Talles europeos / estándar
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '34', '34', 20.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '36', '36', 21.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '38', '38', 22.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '40', '40', 23.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '42', '42', 24.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '44', '44', 25.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '46', '46', 26.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '48', '48', 27.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '50', '50', 28.0, NULL, true),

    -- Plus size numérico
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '52', '52', 30.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '54', '54', 31.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '56', '56', 32.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '58', '58', 33.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '60', '60', 34.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '62', '62', 35.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '64', '64', 36.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '66', '66', 37.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '68', '68', 38.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '70', '70', 39.0, NULL, true),

    -- Plus size alfabético
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '1X', '1X', 40.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '2X', '2X', 41.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '3X', '3X', 42.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '4X', '4X', 43.0, NULL, true),
    ((SELECT id FROM size_systems WHERE name = 'ropa'), '5X', '5X', 44.0, NULL, true);
");

            migrationBuilder.Sql(@"
                INSERT INTO colors (name, display_name, sort_order, is_active) VALUES
                ('arena',     'Arena',     1.0, true),
                ('beige',     'Beige',     2.0, true),
                ('blanco',    'Blanco',    3.0, true),
                ('crudo',     'Crudo',     4.0, true),
                ('gris topo', 'Gris Topo', 5.0, true),
                ('marron',    'Marrón',    6.0, true),
                ('negro',     'Negro',     7.0, true),
                ('rojo',      'Rojo',      8.0, true),
                ('vison',     'Visón',     9.0, true);
            ");

            // ── 3. Agregar FK columns como nullable (para poder hacer backfill) ──
            migrationBuilder.AddColumn<int>(
                name: "size_system_id",
                table: "products",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "size_id",
                table: "product_variants",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "color_id",
                table: "product_variants",
                type: "integer",
                nullable: true);

            // ── 4. Backfill usando unaccent para tolerar tildes ───────────────────

            // vizon y vison → vison (ambos sin tilde, match exacto)
            migrationBuilder.Sql(@"
                UPDATE product_variants
                SET color_id = (SELECT id FROM colors WHERE name = 'vison')
                WHERE unaccent(LOWER(TRIM(color))) IN ('vison', 'vizon');
            ");

            // Resto de colores: normaliza tildes en ambos lados
            migrationBuilder.Sql(@"
                UPDATE product_variants pv
                SET color_id = c.id
                FROM colors c
                WHERE unaccent(LOWER(TRIM(pv.color))) = unaccent(c.name)
                  AND pv.color_id IS NULL;
            ");

            // Talles: normaliza tildes en ambos lados
            migrationBuilder.Sql(@"
                UPDATE product_variants pv
                SET size_id = s.id
                FROM sizes s
                WHERE unaccent(LOWER(TRIM(pv.size))) = unaccent(s.name)
                  AND pv.size_id IS NULL;
            ");

            

            // ── 5. Eliminar índice único viejo y columnas string ─────────────────
            migrationBuilder.DropIndex(
                name: "IX_product_variants_product_id_size_color",
                table: "product_variants");

            migrationBuilder.DropColumn(
                name: "color",
                table: "product_variants");

            migrationBuilder.DropColumn(
                name: "size",
                table: "product_variants");

            // ── 6. Hacer NOT NULL (datos ya backfilleados) ────────────────────────
            migrationBuilder.AlterColumn<int>(
                name: "size_id",
                table: "product_variants",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "color_id",
                table: "product_variants",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            // ── 7. Índices FK ─────────────────────────────────────────────────────
            migrationBuilder.CreateIndex(
                name: "IX_products_size_system_id",
                table: "products",
                column: "size_system_id");

            migrationBuilder.CreateIndex(
                name: "IX_product_variants_size_id",
                table: "product_variants",
                column: "size_id");

            migrationBuilder.CreateIndex(
                name: "IX_product_variants_color_id",
                table: "product_variants",
                column: "color_id");

            migrationBuilder.CreateIndex(
                name: "IX_product_variants_product_id_size_id_color_id",
                table: "product_variants",
                columns: new[] { "product_id", "size_id", "color_id" },
                unique: true);

            // ── 8. FK constraints ─────────────────────────────────────────────────
            migrationBuilder.AddForeignKey(
                name: "FK_product_variants_colors_color_id",
                table: "product_variants",
                column: "color_id",
                principalTable: "colors",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_product_variants_sizes_size_id",
                table: "product_variants",
                column: "size_id",
                principalTable: "sizes",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_products_size_systems_size_system_id",
                table: "products",
                column: "size_system_id",
                principalTable: "size_systems",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Restaurar columnas string (nullable para backfill)
            migrationBuilder.AddColumn<string>(
                name: "size",
                table: "product_variants",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "color",
                table: "product_variants",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            // Backfill desde catálogo
            migrationBuilder.Sql(@"
                UPDATE product_variants pv
                SET size = s.name
                FROM sizes s WHERE s.id = pv.size_id;
            ");

            migrationBuilder.Sql(@"
                UPDATE product_variants pv
                SET color = c.name
                FROM colors c WHERE c.id = pv.color_id;
            ");

            // Hacer NOT NULL
            migrationBuilder.AlterColumn<string>(
                name: "size",
                table: "product_variants",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "color",
                table: "product_variants",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);

            // Restaurar índice único original
            migrationBuilder.DropIndex(
                name: "IX_product_variants_product_id_size_id_color_id",
                table: "product_variants");

            migrationBuilder.CreateIndex(
                name: "IX_product_variants_product_id_size_color",
                table: "product_variants",
                columns: new[] { "product_id", "size", "color" },
                unique: true);

            // Eliminar FKs
            migrationBuilder.DropForeignKey(
                name: "FK_product_variants_colors_color_id",
                table: "product_variants");

            migrationBuilder.DropForeignKey(
                name: "FK_product_variants_sizes_size_id",
                table: "product_variants");

            migrationBuilder.DropForeignKey(
                name: "FK_products_size_systems_size_system_id",
                table: "products");

            // Eliminar índices FK
            migrationBuilder.DropIndex(name: "IX_products_size_system_id", table: "products");
            migrationBuilder.DropIndex(name: "IX_product_variants_size_id", table: "product_variants");
            migrationBuilder.DropIndex(name: "IX_product_variants_color_id", table: "product_variants");

            // Eliminar columnas FK
            migrationBuilder.DropColumn(name: "size_system_id", table: "products");
            migrationBuilder.DropColumn(name: "size_id", table: "product_variants");
            migrationBuilder.DropColumn(name: "color_id", table: "product_variants");

            // Eliminar tablas catálogo
            migrationBuilder.DropTable(name: "sizes");
            migrationBuilder.DropTable(name: "size_systems");
            migrationBuilder.DropTable(name: "colors");
        }
    }
}
