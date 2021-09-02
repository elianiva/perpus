import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import Jurusan from "App/Models/Jurusan";
import User from "App/Models/User";

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
      session.flash({ error: "Harap login terlebih dahulu!" });
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

  public async form({ request, response, session, auth, view }: HttpContextContract) {
    const { isEditing, id } = request.qs();

    try {
      await auth.use("web").authenticate();
      const majors = (await Jurusan.all()).map((major) => [major.id, major.nama]);

      if (isEditing) {
        const user = await User.findBy("id", id);
        if (!user) {
          console.error("NOT FOUND");
          return response.redirect().back();
        }

        await user.load("profil", (profil) => profil.preload("jurusan"));
        return view.render("admin/dashboard/anggota_form", {
          isEditing,
          jurusan: majors,
          data: {
            id: user.id,
            nisn: user.profil.nisn,
            email: user.email,
            nama_lengkap: user.profil.nama,
            jenis_kelamin: user.profil.sex,
            kelas: user.profil.kelas,
            jurusan: user.profil.jurusan.nama,
          },
        });
      }

      return view.render("admin/dashboard/anggota_form", {
        jurusan: majors,
      });
    } catch (err) {
      console.error(err);
      session.flash({ error: "Harap login terlebih dahulu" });
      return response.redirect("/admin/login");
    }
  }
}
