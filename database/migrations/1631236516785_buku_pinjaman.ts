import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class BukuPinjaman extends BaseSchema {
  protected tableName = "buku_pinjaman";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary().notNullable().unsigned();
      table.integer("id_buku").unsigned();
      table.integer("id_pinjaman").unsigned();
      table.timestamps(true, true);

      table.foreign("id_buku").references("id").inTable("buku").onDelete("CASCADE");
      table.foreign("id_pinjaman").references("id").inTable("pinjaman").onDelete("CASCADE");
      table.unique(["id_buku", "id_pinjaman"]);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
