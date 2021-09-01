import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";

export default class DashboardController {
  public async index({ response, session, view, auth }: HttpContextContract) {
    try {
      await auth.use("web").authenticate();
      /* prettier-ignore */
      const adminAmount = await Database.from("user")
        .where("id_role", "=", 1)
        .count("* as total");
      const membersAmount = await Database.from("user")
        .where("id_role", "=", 2)
        .count("* as total");

      return view.render("admin/dashboard/index", {
        total_anggota: membersAmount[0].total,
        total_admin: adminAmount[0].total,
      });
    } catch (err) {
      console.error(err);
      session.flash({ error: "Harap login terlebih dahulu" });
      return response.redirect("/admin/login");
    }
  }

  public async anggota({ response, view, auth, session }: HttpContextContract) {
    try {
      await auth.use("web").authenticate();
      return view.render("admin/dashboard/anggota");
    } catch {
      session.flash({ error: "Harap login terlebih dahulu" });
      return response.redirect("/admin/login");
    }
  }
}
