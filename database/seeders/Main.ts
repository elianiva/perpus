import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import { Kind } from "App/Controllers/Http/TransaksiBukuController";
import { Roles } from "App/Models/User";
import {
  BukuFactory,
  TransaksiBukuFactory,
  JurusanFactory,
  RakFactory,
  PinjamanFactory,
  UserFactory,
} from "Database/factories";
import { data } from "../dummy/fake.json";

export default class UserSeeder extends BaseSeeder {
  public async run() {
    const JUMLAH_BUKU = 50;
    const JUMLAH_RAK = 45;

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

    const noRak = Array(45)
      .fill(0)
      .map(() => ["A", "B", "C"])
      .map((codes, idx) =>
        codes.map((code) => ({ noRak: idx + 1 < 10 ? `0${idx + 1}${code}` : `${idx + 1}${code}` }))
      )
      .flat();
    const rak = await RakFactory.merge(noRak).createMany(JUMLAH_RAK);

    const users = await UserFactory.with("profil")
      .merge([
        { role: Roles.ADMIN },
        { role: Roles.ADMIN },
        { role: Roles.ADMIN },
        { role: Roles.ADMIN },
        { role: Roles.ADMIN },
      ])
      .createMany(JUMLAH_BUKU);

    const books = await BukuFactory.merge(
      data.map(
        ({
          judul = "Unknown",
          pengarang = "Unknown",
          penerbit = "Unknown",
          cover_url = "Unknown",
          deskripsi = "Unknown",
        }) => ({
          judul,
          pengarang,
          penerbit,
          deskripsi,
          urlCover: cover_url,
          idRak: rak[Math.floor(Math.random() * JUMLAH_RAK)].id,
        })
      )
    ).createMany(JUMLAH_BUKU);

    const pinjaman = await PinjamanFactory.merge(
      users.map(({ id }) => ({ idUser: id }))
    ).createMany(JUMLAH_BUKU);

    await Promise.all(
      books.map(async (book, idx) => {
        await TransaksiBukuFactory.merge({ idBuku: book.id, jenis: Kind.MASUK }).create();
        await TransaksiBukuFactory.merge({ idBuku: book.id, jenis: Kind.KELUAR }).create();
        await book.related("pinjaman").attach([pinjaman[idx].id]);
      })
    );

    // custom users
    await UserFactory.with("profil")
      .merge([
        { email: "superadmin@asdf.com", password: "admin1234", role: Roles.SUPERADMIN },
        { email: "admin@asdf.com", password: "admin1234", role: Roles.ADMIN },
        { email: "user@asdf.com", password: "user1234", role: Roles.ANGGOTA },
      ])
      .createMany(3);
  }
}
