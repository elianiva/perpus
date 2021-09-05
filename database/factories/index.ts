import User from "App/Models/User";
import Factory from "@ioc:Adonis/Lucid/Factory";
import Profil from "App/Models/Profil";
import Jurusan from "App/Models/Jurusan";
import Role from "App/Models/Role";

export const JurusanFactory = Factory.define(Jurusan, () => ({
  nama: "",
})).build();

export const RoleFactory = Factory.define(Role, () => ({
  nama: "",
})).build();

export const ProfilFactory = Factory.define(Profil, ({ faker }) => {
  return {
    nisn: faker.helpers.replaceSymbolWithNumber("##########"),
    nama: `${faker.name.firstName()} ${faker.name.lastName()}`,
    sex: faker.random.arrayElement(["P", "L"]),
    kelas: faker.random.arrayElement([10, 11, 12, 13]),
    idJurusan: faker.datatype.number({ min: 1, max: 9 }),
  };
}).build();

export const UserFactory = Factory.define(User, ({ faker }) => {
  return {
    email: faker.internet.email(),
    // password: faker.internet.password(),
    password: "foobar",
    idRole: faker.datatype.number({ min: 1, max: 2 }),
  };
})
  .relation("profil", () => ProfilFactory)
  .build();
