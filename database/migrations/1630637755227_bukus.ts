import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Bukus extends BaseSchema {
  protected tableName = "buku";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary().notNullable().unsigned();
      table.string("isbn", 13).notNullable();
      table.string("judul").notNullable();
      table.string("pengarang").notNullable();
      table.string("penerbit").notNullable();
      table.integer("jumlah").notNullable();
      table.string("deskripsi").notNullable();
      table.string("url_cover").notNullable();

      table.timestamps(true, true);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
