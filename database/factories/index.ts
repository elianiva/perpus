import { DateTime } from "luxon";
import Buku from "App/Models/Buku";
import Factory from "@ioc:Adonis/Lucid/Factory";
import Jurusan from "App/Models/Jurusan";
import Pinjaman, { Status } from "App/Models/Pinjaman";
import Profil from "App/Models/Profil";
import Rak from "App/Models/Rak";
import TransaksiBuku from "App/Models/TransaksiBuku";
import User, { Roles } from "App/Models/User";

export const JurusanFactory = Factory.define(Jurusan, () => ({
  nama: "",
})).build();

export const RakFactory = Factory.define(Rak, () => ({
  noRak: "",
})).build();

export const ProfilFactory = Factory.define(Profil, ({ faker }) => ({
  nisn: faker.helpers.replaceSymbolWithNumber("##########"),
  jenisKelamin: faker.random.arrayElement([0, 1]),
  kelas: faker.random.arrayElement([10, 11, 12, 13]),
  idJurusan: faker.datatype.number({ min: 1, max: 9 }),
})).build();

export const UserFactory = Factory.define(User, ({ faker }) => ({
  nama: `${faker.name.firstName()} ${faker.name.lastName()}`,
  email: faker.internet.email(),
  password: "foobar",
  role: Roles.ANGGOTA,
}))
  .relation("profil", () => ProfilFactory)
  .build();

export const TransaksiBukuFactory = Factory.define(TransaksiBuku, ({ faker }) => ({
  alasan: faker.random.arrayElement(["Hilang", "Dihibahkan", "Tidak Diketahui"]),
  jumlah: faker.datatype.number(10),
})).build();

export const PinjamanFactory = Factory.define(Pinjaman, ({ faker }) => ({
  status: faker.random.arrayElement(Object.values(Status).filter((x) => typeof x !== "number")),
  tglPinjam: DateTime.fromISO(faker.date.between("2021-10-12", "2021-11-12").toISOString()),
})).build();

export const BukuFactory = Factory.define(Buku, ({ faker }) => ({
  isbn: faker.helpers.replaceSymbolWithNumber("#############"),
  judul: faker.company.companyName(),
  kategori: faker.random.arrayElement([
    "Fiksi",
    "Filosofi",
    "Informatika",
    "Non-Fiksi",
    "Sains",
    "Teknologi",
  ]),
  pengarang: `${faker.name.firstName()} ${faker.name.lastName()}`,
  penerbit: faker.company.companyName(),
  urlCover: faker.image.imageUrl(220, 400),
  urlPdf: faker.random.arrayElement([undefined, "placeholder.pdf"]),
  deskripsi: faker.lorem.sentence(22),
  jumlah: faker.datatype.number(100),
})).build();
