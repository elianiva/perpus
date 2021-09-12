import { DateTime } from "luxon";
import { BaseModel, column, HasMany, hasMany, manyToMany, ManyToMany } from "@ioc:Adonis/Lucid/Orm";
import BukuMasuk from "./BukuMasuk";
import BukuKeluar from "./BukuKeluar";
import Pinjaman from "./Pinjaman";

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
  public url_cover: string;

  @hasMany(() => BukuMasuk, { foreignKey: "idBuku" })
  public bukuMasuk: HasMany<typeof BukuMasuk>;

  @hasMany(() => BukuKeluar, { foreignKey: "idBuku" })
  public bukuKeluar: HasMany<typeof BukuKeluar>;

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
