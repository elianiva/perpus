import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import Jurusan from "App/Models/Jurusan";
import User from "App/Models/User";

export default class DashboardController {
  public async index({ response, view, logger, auth }: HttpContextContract) {
    try {
      /* prettier-ignore */
      const adminAmount = await Database.from("user")
        .where("id_role", "=", 1)
        .count("* as total");
      const membersAmount = await Database.from("user")
        .where("id_role", "=", 2)
        .count("* as total");

      await auth.user!.load("profil");
      return view.render("admin/dashboard/index", {
        totalAnggota: membersAmount[0].total,
        totalAdmin: adminAmount[0].total,
        currentUserName: auth.user!.profil.nama,
      });
    } catch (err) {
      logger.error("DashboardController.index: ", err.messages);
      return response.badRequest({ error: err.messages });
    }
  }

  public async bukuTable({ response, view, auth, logger }: HttpContextContract) {
    try {
      await auth.user!.load("profil");
      return view.render("admin/dashboard/buku", {
        currentUserName: auth.user!.profil.nama,
      });
    } catch (err) {
      logger.error("DashboardController.bukuTable: ", err.messages);
      return response.badRequest({ error: err.messages });
    }
  }

  public async bukuMasukTable({ response, view, auth, logger }: HttpContextContract) {
    try {
      await auth.user!.load("profil");
      return view.render("admin/dashboard/buku_masuk", {
        currentUserName: auth.user!.profil.nama,
      });
    } catch (err) {
      logger.error("DashboardController.bukuMasukTable: ", err.messages);
      return response.badRequest({ error: err.messages });
    }
  }

  public async bukuForm({ request, response, view, logger, auth }: HttpContextContract) {
    const { isEditing, id } = request.qs();

    try {
      if (isEditing) {
        const user = await User.findBy("id", id);
        if (!user) {
          logger.error("NOT FOUND", { ctx: { id } });
          return response.redirect().back();
        }
        return view.render("admin/dashboard/buku_form", {
          currentUserName: auth.user!.profil.nama,
          isEditing,
          data: {
            id: user.id,
            isbn: user.profil.nisn,
            email: user.email,
            nama_lengkap: user.profil.nama,
            jenis_kelamin: user.profil.sex,
            kelas: user.profil.kelas,
            jurusan: user.profil.jurusan?.nama,
          },
        });
      }

      await auth.user!.load("profil");
      return view.render("admin/dashboard/buku_form", {
        currentUserName: auth.user!.profil.nama,
      });
    } catch (err) {
      logger.error("DashboardController.bukuForm: ", err.messages);
      return response.badRequest({ error: err.messages });
    }
  }
  public async userTable({ response, request, view, auth, logger }: HttpContextContract) {
    try {
      const { type } = request.params();
      await auth.user!.load("profil");
      return view.render("admin/dashboard/user", {
        currentPage: type,
        currentUserName: auth.user!.profil.nama,
      });
    } catch (err) {
      logger.error("DashboardController.userTable: ", err.messages);
      return response.badRequest({ error: err.messages });
    }
  }

  public async userForm({ request, response, view, logger, auth }: HttpContextContract) {
    const { type } = request.params();
    const { isEditing, id } = request.qs();

    try {
      const majors = (await Jurusan.all()).map((major) => [major.id, major.nama]);

      if (isEditing) {
        const user = await User.findBy("id", id);
        if (!user) {
          logger.error("NOT FOUND", { ctx: { id } });
          return response.redirect().back();
        }

        await user.load("profil", (profil) => profil.preload("jurusan"));
        return view.render("admin/dashboard/user_form", {
          currentUserName: auth.user!.profil.nama,
          currentPage: type,
          isEditing,
          jurusan: majors,
          data: {
            id: user.id,
            nisn: user.profil.nisn,
            email: user.email,
            nama_lengkap: user.profil.nama,
            jenis_kelamin: user.profil.sex,
            kelas: user.profil.kelas,
            jurusan: user.profil.jurusan?.nama,
          },
        });
      }

      await auth.user!.load("profil");
      return view.render("admin/dashboard/user_form", {
        jurusan: majors,
        currentPage: type,
        currentUserName: auth.user!.profil.nama,
      });
    } catch (err) {
      logger.error("DashboardController.userForm: ", err.messages);
      return response.badRequest({ error: err.messages });
    }
  }

  public async jurusanTable({ response, view, auth, logger }: HttpContextContract) {
    try {
      await auth.user!.load("profil");

      return view.render(`admin/dashboard/jurusan`, {
        currentPage: "jurusan",
        currentUserName: auth.user!.profil.nama,
      });
    } catch (err) {
      logger.error("DashboardController.jurusanTable: ", err.messages);
      return response.badRequest({ error: err.messages });
    }
  }
}
