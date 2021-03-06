import { BaseModel, belongsTo, BelongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import Jurusan from "App/Models/Jurusan";
import { DateTime } from "luxon";
import User from "./User";

export default class Profil extends BaseModel {
  public static table = "profil";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nisn: string;

  @column()
  public jenisKelamin: number;

  @column()
  public kelas: number;

  @column()
  public idUser: number;

  @belongsTo(() => User, { foreignKey: "idUser" })
  public user: BelongsTo<typeof User>;

  @column()
  public idJurusan: number;

  @belongsTo(() => Jurusan, { foreignKey: "idJurusan" })
  public jurusan: BelongsTo<typeof Jurusan>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
