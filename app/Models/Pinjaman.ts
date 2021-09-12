import {
  BaseModel,
  belongsTo,
  BelongsTo,
  column,
  manyToMany,
  ManyToMany,
} from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";
import Buku from "./Buku";
import User from "./User";

export default class Pinjaman extends BaseModel {
  public static table = "pinjaman";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public status: number;

  @column.date()
  public tglPinjam: DateTime;

  @column.date()
  public tglKembali: DateTime;

  @column()
  public idUser: number;

  @belongsTo(() => User, { foreignKey: "idUser" })
  public user: BelongsTo<typeof User>;

  @manyToMany(() => Buku, {
    localKey: "id",
    relatedKey: "id",
    pivotTable: "buku_pinjaman",
    pivotForeignKey: "id_pinjaman",
    pivotRelatedForeignKey: "id_buku",
    pivotTimestamps: true,
  })
  public buku: ManyToMany<typeof Buku>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
