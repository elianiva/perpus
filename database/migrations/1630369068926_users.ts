import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Users extends BaseSchema {
  protected tableName = "user";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary().notNullable().unsigned();
      table.string("email").notNullable();
      table.string("password").notNullable();
      table.integer("id_role", 1).unsigned();
      table.timestamps(true, true);

      table.foreign("id_role").references("id").inTable("role");
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
