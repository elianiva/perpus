import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import {
  BukuFactory,
  BukuKeluarFactory,
  BukuMasukFactory,
  JurusanFactory,
  PinjamanFactory,
  RoleFactory,
  UserFactory,
} from "Database/factories";

export default class UserSeeder extends BaseSeeder {
  public async run() {
    await JurusanFactory.merge([
      { nama: "Akomodasi Perhotelan" },
      { nama: "Usaha Perjalanan Wisata" },
      { nama: "Tata Boga" },
      { nama: "Tata Busana" },
      { nama: "Desain Fesyen" },
      { nama: "Kecantikan Kulit dan Rambut" },
      { nama: "Teknik Komputer dan Jaringan" },
      { nama: "Rekayasa Perangkat Lunak" },
      { nama: "Multimedia" },
    ]).createMany(9);

    await RoleFactory.merge([
      { id: 1, nama: "ADMIN" },
      { id: 2, nama: "ANGGOTA" },
    ]).createMany(2);

    const AMOUNT = 30;
    const users = await UserFactory.with("profil").createMany(AMOUNT);

    const books = await BukuFactory.merge({ url_cover: "placeholder.png" }).createMany(AMOUNT);
    const pinjaman = await PinjamanFactory.merge(
      users.map(({ id }) => ({ idUser: id }))
    ).createMany(AMOUNT);

    await Promise.all(
      books.map(async (book, idx) => {
        await BukuKeluarFactory.merge({ idBuku: book.id }).create();
        await BukuMasukFactory.merge({ idBuku: book.id }).create();
        await book.related("pinjaman").attach([pinjaman[idx].id]);
      })
    );

    // custom users
    await UserFactory.with("profil")
      .merge([
        { email: "admin@asdf.com", password: "admin1234", idRole: 1 },
        { email: "user@asdf.com", password: "user1234", idRole: 2 },
      ])
      .createMany(2);
  }
}
