import { BaseModel, belongsTo, BelongsTo, column, HasOne, hasOne } from "@ioc:Adonis/Lucid/Orm";
import Jurusan from "App/Models/Jurusan";
import { DateTime } from "luxon";
import User from "./User";

export default class Profil extends BaseModel {
  public static table = "profil";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nama: string;

  @column()
  public sex: string;

  @column()
  public kelas: number;

  @hasOne(() => User, { foreignKey: "idProfil" })
  public user: HasOne<typeof User>;

  @column()
  public idJurusan: number;

  @belongsTo(() => Jurusan, { foreignKey: "idJurusan" })
  public jurusan: BelongsTo<typeof Jurusan>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
