import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Raks extends BaseSchema {
  protected tableName = "raks";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").notNullable().primary();
      table.string("no_rak").notNullable();

      table.timestamps(true, true);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
