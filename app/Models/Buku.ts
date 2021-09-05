import { DateTime } from "luxon";
import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class Buku extends BaseModel {
  public static table = "buku";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public isbn: string;

  @column()
  public judul: string;

  @column()
  public pengarang: string;

  @column()
  public penerbit: string;

  @column()
  public url_cover: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
