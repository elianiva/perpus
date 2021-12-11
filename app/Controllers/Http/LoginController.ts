import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Hash from "@ioc:Adonis/Core/Hash";
import User, { Roles } from "App/Models/User";
import { rules, schema } from "@ioc:Adonis/Core/Validator";

export default class LoginController {
  public async index({ response, view, auth }: HttpContextContract) {
    try {
      await auth.use("web").authenticate();
      return response.redirect("/admin/dashboard");
    } catch {
      return view.render("login");
    }
  }

  public async login({ request, response, session, auth }: HttpContextContract) {
    try {
      if (auth.user) {
        return response.redirect("/admin/dashboard");
      }

      const loginSchema = schema.create({
        email: schema.string({ trim: true }, [rules.email(), rules.required()]),
        password: schema.string({ trim: true }, [rules.required()]),
      });

      /* eslint-disable */
      const { email, password } = await request.validate({ schema: loginSchema });

      const user = await User.findBy("email", email);
      if (!user) {
        session.flash({ error: `Tidak ada user dengan email ${email}` });
        return response.redirect("/login");
      }

      const isPasswordMatch = await Hash.verify(user.password, password);
      if (!isPasswordMatch) {
        session.flash({ error: "Password yang anda masukkan salah!" });
        return response.redirect("/login");
      }

      await user.load("profil");
      await auth.use("web").login(user);

      if (user.role === Roles.ADMIN || user.role === Roles.SUPERADMIN) {
        return response.redirect("/admin/dashboard");
      }

      return response.redirect("/anggota");
    } catch (err) {
      throw err;
    }
  }

  public async logout({ response, auth }: HttpContextContract) {
    await auth.use("web").logout();
    return response.redirect("/login");
  }
}
