import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class BukuMasuks extends BaseSchema {
  protected tableName = "buku_masuk";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary().notNullable().unsigned();
      table.integer("id_buku").unsigned();
      table.string("alasan").notNullable();
      table.integer("jumlah").notNullable();
      table.timestamps(true, true);

      table.foreign("id_buku").references("id").inTable("buku").onDelete("CASCADE");
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
