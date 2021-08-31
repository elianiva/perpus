import { BaseModel, BelongsTo, belongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";
import User from "./User";

export default class Role extends BaseModel {
  public static table = "role";

  @column({ isPrimary: true })
  public idRole: number;

  @column()
  public nama: string;

  @belongsTo(() => User, { localKey: "idRole" })
  public user: BelongsTo<typeof User>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
