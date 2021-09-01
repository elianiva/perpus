import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";

export default class UsersController {
  public async create({}: HttpContextContract) {}

  public async store({}: HttpContextContract) {}

  public async show({ response }: HttpContextContract) {
    const allUsers = await User.all();
    await Promise.all(
      allUsers.map((user) => user.load("profil", (profil) => profil.preload("jurusan")))
    );

    const data = allUsers.map((user) => ({
      id: user.id,
      email: user.email,
      nama_lengkap: user.profil.nama,
      jenis_kelamin: user.profil.sex === "P" ? "Perempuan" : "Laki Laki",
      kelas: user.profil.kelas,
      jurusan: user.profil.jurusan.nama,
    }));
    return response.send({ data });
  }

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({ request, response, session }: HttpContextContract) {
    const id = request.input("user-id");
    try {
      const user = await User.findBy("id", id);
      if (!user) {
        session.flash({ error: `Tidak ada user dengan id ${id}` });
        return response.redirect().back();
      }

      await user.delete();

      return response.redirect().back();
    } catch (err) {
      console.error(err);
      session.flash({ error: err.message });
      return response.redirect().back();
    }
  }
}
