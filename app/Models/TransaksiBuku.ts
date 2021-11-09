import { BaseModel, BelongsTo, belongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";
import Buku from "./Buku";

export default class TransaksiBuku extends BaseModel {
  public static table = "transaksi_buku";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public idBuku: number;

  @belongsTo(() => Buku, { foreignKey: "idBuku" })
  public buku: BelongsTo<typeof Buku>;

  @column()
  public alasan: string;

  @column()
  public jumlah: number;

  @column()
  public jenis: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
