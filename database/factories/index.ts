import Factory from "@ioc:Adonis/Lucid/Factory";
import Buku from "App/Models/Buku";
import BukuKeluar from "App/Models/BukuKeluar";
import BukuMasuk from "App/Models/BukuMasuk";
import Jurusan from "App/Models/Jurusan";
import Pinjaman from "App/Models/Pinjaman";
import Profil from "App/Models/Profil";
import Role from "App/Models/Role";
import User from "App/Models/User";
import { DateTime } from "luxon";

export const JurusanFactory = Factory.define(Jurusan, () => ({
  nama: "",
})).build();

export const RoleFactory = Factory.define(Role, () => ({
  nama: "",
})).build();

export const ProfilFactory = Factory.define(Profil, ({ faker }) => ({
  nisn: faker.helpers.replaceSymbolWithNumber("##########"),
  nama: `${faker.name.firstName()} ${faker.name.lastName()}`,
  jenis_kelamin: faker.random.arrayElement(["P", "L"]),
  kelas: faker.random.arrayElement([10, 11, 12, 13]),
  idJurusan: faker.datatype.number({ min: 1, max: 9 }),
})).build();

export const UserFactory = Factory.define(User, ({ faker }) => ({
  email: faker.internet.email(),
  // password: faker.internet.password(),
  password: "foobar",
  idRole: faker.datatype.number({ min: 1, max: 2 }),
}))
  .relation("profil", () => ProfilFactory)
  .build();

export const BukuMasukFactory = Factory.define(BukuMasuk, ({ faker }) => ({
  alasan: faker.random.arrayElement(["Bantuan Pemerintah", "Beli", "Hibah", "Tidak Diketahui"]),
  jumlah: faker.datatype.number(10),
})).build();

export const BukuKeluarFactory = Factory.define(BukuKeluar, ({ faker }) => ({
  alasan: faker.random.arrayElement(["Hilang", "Dihibahkan", "Tidak Diketahui"]),
  jumlah: faker.datatype.number(10),
})).build();

export const PinjamanFactory = Factory.define(Pinjaman, ({ faker }) => ({
  status: faker.random.arrayElement([0, 1]),
  tglPinjam: DateTime.fromObject({ ordinal: faker.datatype.number(364) + 1 }),
  tglKembali: DateTime.fromObject({ ordinal: faker.datatype.number(364) + 1 }),
})).build();

export const BukuFactory = Factory.define(Buku, ({ faker }) => ({
  isbn: faker.helpers.replaceSymbolWithNumber("#############"),
  judul: faker.company.companyName(),
  pengarang: `${faker.name.firstName()} ${faker.name.lastName()}`,
  penerbit: faker.company.companyName(),
  url_cover: faker.image.imageUrl(220, 400),
  deskripsi: faker.lorem.sentence(22),
  jumlah: faker.datatype.number(100),
})).build();
