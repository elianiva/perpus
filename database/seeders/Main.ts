import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import {
  BukuFactory,
  BukuKeluarFactory,
  BukuMasukFactory,
  JurusanFactory,
  RakFactory,
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

    const noRak = Array(45)
      .fill(0)
      .map(() => ["A", "B", "C"])
      .map((codes, idx) =>
        codes.map((code) => ({ noRak: idx + 1 < 10 ? `0${idx + 1}${code}` : `${idx + 1}${code}` }))
      )
      .flat();
    const rak = await RakFactory.merge(noRak).createMany(45);

    const AMOUNT = 60;
    const users = await UserFactory.with("profil").createMany(AMOUNT);

    const books = await BukuFactory.merge(
      Array(AMOUNT)
        .fill(0)
        .map(() => ({
          urlCover: "placeholder.png",
          idRak: rak[Math.floor(Math.random() * 45)].id,
        }))
    ).createMany(AMOUNT);

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
