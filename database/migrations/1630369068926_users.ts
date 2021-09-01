import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Users extends BaseSchema {
  protected tableName = "user";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary().notNullable().unsigned();
      table.string("email");
      table.string("password");
      table.integer("id_role", 1).unsigned();
      table.integer("id_profil").unsigned();
      table.timestamps(true, true);

      table.foreign("id_role").references("id").inTable("role");
      table.foreign("id_profil").references("id").inTable("profil").onDelete("CASCADE");
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
