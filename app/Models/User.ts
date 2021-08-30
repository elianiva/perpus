import { DateTime } from "luxon";
import { BaseModel, beforeSave, column, HasOne, hasOne } from "@ioc:Adonis/Lucid/Orm";
import Hash from "@ioc:Adonis/Core/Hash";
import Profil from "./Profil";

export default class User extends BaseModel {
  public static table = "user";

  @column({ isPrimary: true })
  public idUser: number;

  @column()
  public email: string;

  @column({ serializeAs: null })
  public password: string;

  @column({ serializeAs: "id_profil" })
  public idProfil: number;

  @hasOne(() => Profil, { foreignKey: "idProfil" })
  public profil: HasOne<typeof Profil>;

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
