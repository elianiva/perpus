import { BaseModel, column, hasMany, HasMany } from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";
import Buku from "App/Models/Buku";

export enum Something {
  Foo = 2,
  Bar,
}

export default class Rak extends BaseModel {
  public static table = "rak";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public noRak: string;

  @hasMany(() => Buku, { foreignKey: "idRak" })
  public buku: HasMany<typeof Buku>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
