import { BaseModel, column, HasMany, hasMany } from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";
import User from "./User";

export default class Role extends BaseModel {
  public static table = "role";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nama: string;

  @hasMany(() => User, {
    foreignKey: "idRole",
  })
  public user: HasMany<typeof User>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
