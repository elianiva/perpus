import Database from "@ioc:Adonis/Lucid/Database";
import {
  BaseModel,
  beforeSave,
  belongsTo,
  BelongsTo,
  column,
  manyToMany,
  ManyToMany,
} from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";
import Buku from "./Buku";
import User from "./User";

export enum Status {
  TERTUNDA = "TERTUNDA",
  DITOLAK = "DITOLAK",
  DITERIMA = "DITERIMA",
  DIKEMBALIKAN = "DIKEMBALIKAN",
}

export default class Pinjaman extends BaseModel {
  public static table = "pinjaman";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public status: Status;

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

  @beforeSave()
  public static async changeValidState(pinjaman: Pinjaman) {
    const user = await User.findOrFail(pinjaman.idUser);

    const belumDikembalikan = await Database.rawQuery(
      "SELECT id FROM `pinjaman` WHERE id_user=? AND (status=? OR status=?)",
      [user.id, Status.TERTUNDA, Status.DITERIMA]
    );

    user.valid = belumDikembalikan[0].length <= 5;
    await user.save();
  }
}
