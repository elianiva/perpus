import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import { JurusanFactory, ProfilFactory, UserFactory } from "Database/factories";

export default class UserSeeder extends BaseSeeder {
  public async run() {
    await JurusanFactory.createMany(9);
    await UserFactory.merge({ password: "foobar" }).createMany(3, async (user) => {
      user.idProfil = (await ProfilFactory.create()).idProfil;
    });
  }
}
