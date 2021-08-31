import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Users extends BaseSchema {
  protected tableName = "user";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id_user").primary().notNullable().unsigned();
      table.string("email", 32);
      table.string("password");
      table.integer("id_role", 1).unsigned();
      table.integer("id_profil").unsigned();
      table.timestamps(true, true);

      table.foreign("id_role").references("id_role").inTable("role");
      table.foreign("id_profil").references("id_profil").inTable("profil").onDelete("CASCADE");
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
