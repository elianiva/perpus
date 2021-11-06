import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Profils extends BaseSchema {
  protected tableName = "profil";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary().notNullable().unsigned();
      table.string("nisn", 10).notNullable();
      table.string("nama").notNullable();
      table.string("jenis_kelamin", 1).notNullable();
      table.integer("kelas", 2).notNullable();
      table.integer("id_jurusan").unsigned();
      table.integer("id_user").unsigned();
      table.timestamps(true, true);

      table.foreign("id_jurusan").references("id").inTable("jurusan").onDelete("SET NULL");
      table.foreign("id_user").references("id").inTable("user").onDelete("CASCADE");
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
