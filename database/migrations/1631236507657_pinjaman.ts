import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Pinjaman extends BaseSchema {
  protected tableName = "pinjaman";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary().notNullable().unsigned();
      table.integer("status", 1).defaultTo(0);
      table.date("tgl_pinjam");
      table.date("tgl_kembali");
      table.integer("id_user").unsigned();
      table.timestamps(true, true);

      table.foreign("id_user").references("id").inTable("user");
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
