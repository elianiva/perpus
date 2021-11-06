import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Roles extends BaseSchema {
  protected tableName = "role";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer("id", 1).primary().notNullable().unsigned();
      table.string("nama", 32).notNullable();
      table.timestamps(true, true);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
