import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  HasMany,
  hasMany,
  manyToMany,
  ManyToMany,
} from "@ioc:Adonis/Lucid/Orm";
import Pinjaman from "App/Models/Pinjaman";
import Rak from "App/Models/Rak";
import TransaksiBuku from "App/Models/TransaksiBuku";
import { DateTime } from "luxon";

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
  public jumlah: number;

  @column()
  public deskripsi: string;

  @column()
  public urlCover: string;

  @column()
  public idRak: number;

  @belongsTo(() => Rak, { foreignKey: "idRak" })
  public rak: BelongsTo<typeof Rak>;

  @hasMany(() => TransaksiBuku, { foreignKey: "idBuku" })
  public transaksiBuku: HasMany<typeof TransaksiBuku>;

  @manyToMany(() => Pinjaman, {
    localKey: "id",
    relatedKey: "id",
    pivotTable: "buku_pinjaman",
    pivotForeignKey: "id_buku",
    pivotRelatedForeignKey: "id_pinjaman",
    pivotTimestamps: true,
  })
  public pinjaman: ManyToMany<typeof Pinjaman>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
