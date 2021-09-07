import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Hash from "@ioc:Adonis/Core/Hash";
import User from "App/Models/User";
import { rules, schema } from "@ioc:Adonis/Core/Validator";

export default class LoginController {
  public async index({ response, view, auth }: HttpContextContract) {
    try {
      await auth.use("web").authenticate();
      return response.redirect("/admin/dashboard");
    } catch {
      return view.render("admin/login");
    }
  }

  public async login({ request, response, session, logger, auth }: HttpContextContract) {
    if (auth.user) {
      return response.redirect("/admin/dashboard");
    }

    const loginSchema = schema.create({
      email: schema.string({ trim: true }, [rules.email(), rules.required()]),
      password: schema.string({ trim: true }, [rules.required()]),
      remember_me: schema.boolean.optional(),
    });

    try {
      /* eslint-disable */
      const { email, password, remember_me } = await request.validate({ schema: loginSchema });

      const user = await User.findBy("email", email);
      if (!user) {
        session.flash({ error: `Tidak ada user dengan email ${email}` });
        return response.redirect("/login");
      }

      await user.load("role");
      if (user.role.nama !== "ADMIN") {
        session.flash({ error: "Anda bukan admin!" });
        return response.redirect("/login");
      }

      const isPasswordMatch = await Hash.verify(user.password, password);
      if (!isPasswordMatch) {
        session.flash({ error: "Password yang anda masukkan salah!" });
        return response.redirect("/login");
      }

      await user.load("profil");
      await auth.use("web").login(user, remember_me);

      return response.redirect("/admin/dashboard");
    } catch (err) {
      logger.error("LoginController.login: %o", err.messages);
      return response.badRequest(err.messages);
    }
  }

  public async logout({ response, auth }: HttpContextContract) {
    await auth.use("web").logout();
    return response.redirect("/login");
  }
}
