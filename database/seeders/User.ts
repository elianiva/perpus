import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import { JurusanFactory, ProfilFactory, RoleFactory, UserFactory } from "Database/factories";

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
    await UserFactory.merge([
      ...new Array(AMOUNT).fill(0).map((_, i) => ({
        idRole: i < 5 ? 1 : 2,
        password: "foobar",
      })),
    ]).createMany(AMOUNT, async (user) => {
      user.idProfil = (await ProfilFactory.create()).id;
    });
  }
}
