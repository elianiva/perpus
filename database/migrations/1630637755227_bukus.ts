import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Bukus extends BaseSchema {
  protected tableName = "buku";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.string("isbn", 13).unique();
      table.string("judul");
      table.string("pengarang");
      table.string("penerbit");
      table.integer("jumlah");
      table.string("deskripsi");
      table.string("url_cover");

      table.timestamps(true, true);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
