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
      { idRole: 1, nama: "ADMIN" },
      { idRole: 2, nama: "SISWA" },
    ]).createMany(2);

    await UserFactory.merge({ password: "foobar", idRole: 2 }).createMany(3, async (user) => {
      user.idProfil = (await ProfilFactory.create()).idProfil;
    });
  }
}
