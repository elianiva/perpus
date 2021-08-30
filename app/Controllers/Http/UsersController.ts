import Hash from "@ioc:Adonis/Core/Hash";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";
import { rules, schema } from "@ioc:Adonis/Core/Validator";

export default class UsersController {
  public async login({ request, response, session }: HttpContextContract) {
    if (session.get("id_user")) {
      return response.redirect("/admin/dashboard");
    }

    const userSchema = schema.create({
      email: schema.string({ trim: true }, [rules.email(), rules.required()]),
      password: schema.string({ trim: true }, [rules.required()]),
    });

    try {
      const { email, password } = await request.validate({ schema: userSchema });

      const user = await User.findBy("email", email);
      if (!user) {
        session.flash({ error: `Tidak ada user dengan email ${email}` });
        return response.redirect("/admin/login");
      }

      const isPasswordMatch = await Hash.verify(user.password, password);
      if (!isPasswordMatch) {
        session.flash({ error: "Password yang anda masukkan salah!" });
        return response.redirect("/admin/login");
      }

      // load the rest of the required data
      await user.load("profil");

      session.put("id_user", user.idUser);
      session.put("nama_user", user.profil.nama);
      return response.redirect("/admin/dashboard");
    } catch (err) {
      return response.badRequest(err.messages);
    }
  }

  public async create({}: HttpContextContract) {}

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
