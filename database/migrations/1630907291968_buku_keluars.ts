import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class BukuKeluars extends BaseSchema {
  protected tableName = "buku_keluar";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.integer("id_buku").unsigned();
      table.string("alasan");
      table.integer("jumlah");
      table.timestamps(true, true);

      table.foreign("id_buku").references("id").inTable("buku").onDelete("CASCADE");
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
