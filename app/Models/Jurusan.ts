import { BaseModel, column, HasMany, hasMany } from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";
import Profil from "./Profil";

export default class Jurusan extends BaseModel {
  public static table = "jurusan";

  @column({ isPrimary: true })
  public idJurusan: number;

  @column()
  public nama: string;

  @hasMany(() => Profil, { foreignKey: "idProfil" })
  public profil: HasMany<typeof Profil>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
