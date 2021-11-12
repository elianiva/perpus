import BaseSchema from "@ioc:Adonis/Lucid/Schema";
import { Status } from "App/Models/Pinjaman";

export default class Pinjaman extends BaseSchema {
  protected tableName = "pinjaman";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary().notNullable().unsigned();
      table.date("tgl_pinjam").notNullable();
      table.date("tgl_kembali");
      table.enum(
        "status",
        Object.values(Status).filter((x) => typeof x !== "number")
      );
      table.integer("id_user").unsigned();
      table.timestamps(true, true);

      table.foreign("id_user").references("id").inTable("user").onDelete("CASCADE");
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
