import Hash from "@ioc:Adonis/Core/Hash";
import { BaseModel, beforeSave, belongsTo, BelongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";
import Profil from "./Profil";
import Role from "./Role";

export default class User extends BaseModel {
  public static table = "user";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public email: string;

  @column({ serializeAs: null })
  public password: string;

  @column()
  public idRole: number;

  @belongsTo(() => Role, {
    foreignKey: "idRole",
  })
  public role: BelongsTo<typeof Role>;

  @column()
  public idProfil: number;

  @belongsTo(() => Profil, { foreignKey: "idProfil" })
  public profil: BelongsTo<typeof Profil>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      const { password } = user;
      user.password = await Hash.make(password);
    }
  }
}
