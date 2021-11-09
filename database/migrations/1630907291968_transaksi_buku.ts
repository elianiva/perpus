import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class TransaksiBuku extends BaseSchema {
  protected tableName = "transaksi_buku";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.integer("id_buku").unsigned();
      table.string("alasan").notNullable();
      table.integer("jumlah").notNullable();
      table.boolean("jenis").defaultTo(0).notNullable();
      table.timestamps(true, true);

      table.foreign("id_buku").references("id").inTable("buku").onDelete("CASCADE");
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
