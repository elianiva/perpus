import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Profils extends BaseSchema {
  protected tableName = "profil";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary().notNullable().unsigned();
      table.string("nama");
      table.string("sex", 1);
      table.integer("kelas", 2);
      table.integer("id_jurusan").unsigned();
      table.timestamps(true, true);

      table.foreign("id_jurusan").references("id").inTable("jurusan");
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
