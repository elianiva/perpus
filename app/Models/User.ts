import Hash from "@ioc:Adonis/Core/Hash";
import Database from "@ioc:Adonis/Lucid/Database";
import {
  afterSave,
  BaseModel,
  beforeSave,
  column,
  HasMany,
  hasMany,
  HasOne,
  hasOne,
} from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";
import Pinjaman, { Status } from "./Pinjaman";
import Profil from "./Profil";

export enum Roles {
  ANGGOTA = "ANGGOTA",
  ADMIN = "ADMIN",
  SUPERADMIN = "SUPERADMIN",
}

export default class User extends BaseModel {
  public static table = "user";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nama: string;

  @column()
  public email: string;

  @column({ serializeAs: null })
  public password: string;

  @column()
  public role: Roles;

  @hasOne(() => Profil, { foreignKey: "idUser" })
  public profil: HasOne<typeof Profil>;

  @hasMany(() => Pinjaman, { foreignKey: "idUser" })
  public pinjaman: HasMany<typeof Pinjaman>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @column()
  public valid: boolean;

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      const { password } = user;
      user.password = await Hash.make(password);
    }
  }
}
