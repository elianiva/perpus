import User from "App/Models/User";
import Factory from "@ioc:Adonis/Lucid/Factory";
import Profil from "App/Models/Profil";
import Jurusan from "App/Models/Jurusan";

export const JurusanFactory = Factory.define(Jurusan, ({ faker }) => {
  return {
    nama: faker.random.arrayElement([
      "Akomodasi Perhotelan",
      "Usaha Perjalanan Wisata",
      "Tata Boga",
      "Tata Busana",
      "Desain Fesyen",
      "Kecantikan Kulit dan Rambut",
      "Teknik Komputer dan Jaringan",
      "Rekayasa Perangkat Lunak",
      "Multimedia",
    ]),
  };
}).build();

export const ProfilFactory = Factory.define(Profil, ({ faker }) => {
  return {
    nama: `${faker.name.firstName()} ${faker.name.lastName()}`,
    sex: faker.random.arrayElement(["P", "L"]),
    kelas: faker.random.arrayElement([10, 11, 12, 13]),
    idJurusan: faker.datatype.number({ min: 1, max: 9 }),
  };
}).build();

export const UserFactory = Factory.define(User, ({ faker }) => {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(),
  };
}).build();
