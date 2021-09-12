import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import Buku from "App/Models/Buku";
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
      const booksAmount = await Database.from("buku").count("* as total");
      const inputBooksAmount = await Database.from("buku_masuk").count("* as total");
      const outputBooksAmount = await Database.from("buku_masuk").count("* as total");
      const majorsAmount = await Database.from("jurusan").count("* as total");

      await auth.user!.load("profil");
      return view.render("admin/dashboard/index", {
        totalBuku: booksAmount[0].total,
        totalAnggota: membersAmount[0].total,
        totalAdmin: adminAmount[0].total,
        totalJurusan: majorsAmount[0].total,
        totalBukuMasuk: inputBooksAmount[0].total,
        totalBukuKeluar: outputBooksAmount[0].total,
        currentUserName: auth.user!.profil.nama,
      });
    } catch (err) {
      logger.error("DashboardController.index: %o", err.messages);
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
      logger.error("DashboardController.bukuTable: %o", err.messages);
      return response.badRequest({ error: err.messages });
    }
  }

  public async pinjamanTable({ response, view, auth, logger }: HttpContextContract) {
    try {
      await auth.user!.load("profil");
      return view.render("admin/dashboard/pinjaman", {
        currentUserName: auth.user!.profil.nama,
      });
    } catch (err) {
      logger.error("DashboardController.pinjamanTable: %o", err.messages);
      return response.badRequest({ error: err.messages });
    }
  }

  private async bukuIO({ response, view, auth, logger }: HttpContextContract, type: string) {
    try {
      const buku = await Buku.all();
      await auth.user!.load("profil");
      return view.render(`admin/dashboard/buku_io`, {
        currentUserName: auth.user!.profil.nama,
        currentPage: type,
        data: {
          buku: buku.map((b) => b.serialize({ fields: ["id", "judul"] })),
        },
      });
    } catch (err) {
      logger.error(`DashboardController.${type}Table: `, err.messages);
      return response.badRequest({ error: err.messages });
    }
  }

  public async bukuMasukTable(ctx: HttpContextContract) {
    return this.bukuIO(ctx, "buku_masuk");
  }

  public async bukuKeluarTable(ctx: HttpContextContract) {
    return this.bukuIO(ctx, "buku_keluar");
  }

  public async bukuForm({ request, response, view, logger, auth }: HttpContextContract) {
    const { isEditing, id } = request.qs();

    try {
      await auth.user!.load("profil");

      if (isEditing) {
        const buku = await Buku.findBy("id", id);
        if (!buku) {
          logger.error("NOT FOUND: %o", { ctx: { id } });
          return response.redirect().back();
        }

        return view.render("admin/dashboard/buku_form", {
          currentUserName: auth.user!.profil.nama,
          isEditing,
          data: {
            id: buku.id,
            isbn: buku.isbn,
            judul: buku.judul,
            pengarang: buku.pengarang,
            penerbit: buku.penerbit,
            deskripsi: buku.deskripsi,
          },
        });
      }

      return view.render("admin/dashboard/buku_form", {
        currentUserName: auth.user!.profil.nama,
      });
    } catch (err) {
      logger.error("DashboardController.bukuForm: %o", err.messages);
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
      logger.error("DashboardController.userTable: %o", err.messages);
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
          logger.error("NOT FOUND: %o", { ctx: { id } });
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
            jenis_kelamin: user.profil.jenis_kelamin,
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
      logger.error("DashboardController.userForm: %o", err.messages);
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
      logger.error("DashboardController.jurusanTable: %o", err.messages);
      return response.badRequest({ error: err.messages });
    }
  }
}
