import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Hash from "@ioc:Adonis/Core/Hash";
import User from "App/Models/User";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import UserController from "App/Controllers/Http/UserController";
import Jurusan from "App/Models/Jurusan";

export default class LoginController {
  public async index({ response, view, auth }: HttpContextContract) {
    try {
      await auth.use("web").authenticate();
      return response.redirect("/admin/dashboard");
    } catch {
      return view.render("login");
    }
  }

  public async login({ request, response, session, logger, auth }: HttpContextContract) {
    if (auth.user) {
      return response.redirect("/admin/dashboard");
    }

    const loginSchema = schema.create({
      email: schema.string({ trim: true }, [rules.email(), rules.required()]),
      password: schema.string({ trim: true }, [rules.required()]),
    });

    try {
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

      if (user.idRole === 1) {
        return response.redirect("/admin/dashboard");
      }

      return response.redirect("/anggota");
    } catch (err) {
      logger.error("LoginController.login: %o", err.messages);
      return response.badRequest(err.messages);
    }
  }

  public async logout({ response, auth }: HttpContextContract) {
    await auth.use("web").logout();
    return response.redirect("/login");
  }

  public async registerView({ response, view, logger, session }: HttpContextContract) {
    try {
      const majors = await Jurusan.all();

      return view.render("register", {
        jurusan: majors.map(({ id, nama }) => ({ id, nama })),
      });
    } catch (err) {
      logger.error("LoginController.registerView: %o", err.message);
      session.flash({ error: "Terdapat kesalahan pada sistem" });
      return response.redirect("/register");
    }
  }

  public async register(ctx: HttpContextContract) {
    try {
      await UserController.createUser(ctx);
      ctx.session.flash({ msg: `Akun berhasil dibuat! Silahkan login` });
      return ctx.response.redirect("/login");
    } catch (err) {
      ctx.logger.error("LoginController.registerView: %o", err.message);
      ctx.session.flash({ error: "Terdapat kesalahan pada sistem" });
      return ctx.response.redirect("/login");
    }
  }
}
