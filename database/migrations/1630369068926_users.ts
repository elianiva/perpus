import BaseSchema from "@ioc:Adonis/Lucid/Schema";
import { Roles } from "App/Models/User";

export default class Users extends BaseSchema {
  protected tableName = "user";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary().notNullable().unsigned();
      table.string("email").notNullable();
      table.string("password").notNullable();
      table
        .enum(
          "role",
          Object.values(Roles).filter((x) => typeof x !== "number"),
          {
            enumName: "role_enum",
            useNative: true,
          }
        )
        .defaultTo(Roles.ANGGOTA);
      table.timestamps(true, true);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
