import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import Buku from "App/Models/Buku";
import Jurusan from "App/Models/Jurusan";
import Pinjaman from "App/Models/Pinjaman";
import Rak from "App/Models/Rak";
import User, { Roles } from "App/Models/User";

export default class DashboardController {
  public async index({ view, auth }: HttpContextContract) {
    /* prettier-ignore */
    const adminAmount = await Database.from("user")
        .where("role", "=", Roles.ADMIN)
        .orWhere("role", "=", Roles.SUPERADMIN)
        .count("* as total");
    const membersAmount = await Database.from("user")
      .where("role", "=", Roles.ANGGOTA)
      .count("* as total");
    const booksAmount = await Database.from("buku").count("* as total");
    const bookTransactionsAmount = await Database.from("transaksi_buku").count("* as total");
    const majorsAmount = await Database.from("jurusan").count("* as total");
    const borrowed = await Database.from("pinjaman").count("* as total").where({ status: 0 });
    const returned = await Database.from("pinjaman").count("* as total").where({ status: 0 });
    const rak = await Database.from("rak").count("* as total");

    await auth.user?.load("profil");
    return view.render("admin/dashboard/index", {
      totalBuku: booksAmount[0].total,
      totalAnggota: membersAmount[0].total,
      totalAdmin: adminAmount[0].total,
      totalJurusan: majorsAmount[0].total,
      totalTransaksiBuku: bookTransactionsAmount[0].total,
      sedangDipinjam: borrowed[0].total,
      sudahDikembalikan: returned[0].total,
      jumlahRak: rak[0].total,
      currentUserName: auth.user?.profil.nama,
    });
  }

  public async bukuTable({ view, auth }: HttpContextContract) {
    await auth.user?.load("profil");
    return view.render("admin/dashboard/buku", {
      currentUserName: auth.user?.profil.nama,
      currentUserRole: auth.user?.role,
    });
  }

  public async pinjamanTable({ auth, view }: HttpContextContract) {
    await auth.user?.load("profil");
    return view.render("admin/dashboard/pinjaman", {
      currentUserName: auth.user?.profil.nama,
      currentUserRole: auth.user?.role,
    });
  }

  public async pinjamanForm({ request, response, view, logger, auth }: HttpContextContract) {
    const { isEditing, id } = request.qs();

    await auth.user?.load("profil");
    const buku = await Buku.all();
    const anggota = await User.all();
    await Promise.all(anggota.map(async (a) => await a.load("profil")));

    if (isEditing) {
      const pinjaman = await Pinjaman.find(id);
      if (!pinjaman) {
        logger.error("NOT FOUND: %o", { ctx: { id } });
        return response.redirect().back();
      }

      await pinjaman.load("buku");
      await pinjaman.load("user");

      const startdate = pinjaman.tglPinjam.toFormat("MM/dd/yyyy");
      const endDate = pinjaman.tglKembali.toFormat("MM/dd/yyyy");

      return view.render("admin/dashboard/pinjaman_form", {
        currentUserName: auth.user?.profil.nama,
        isEditing,
        data: {
          id,
          semuaBuku: buku.map(({ id, judul }) => ({ id, judul })),
          semuaAnggota: anggota.map(({ id, profil: { nama } }) => ({ id, nama })),
          buku: {
            id: pinjaman.buku[0].id,
            judul: pinjaman.buku[0].judul,
          },
          anggota: {
            id: pinjaman.user.id,
          },
          durasi: `${startdate} - ${endDate}`,
        },
      });
    }

    return view.render("admin/dashboard/pinjaman_form", {
      currentUserName: auth.user?.profil.nama,
      data: {
        semuaBuku: buku.map(({ id, judul }) => ({ id, judul })),
        semuaAnggota: anggota.map(({ id, profil: { nama } }) => ({ id, nama })),
      },
    });
  }

  public async kembaliTable({ auth, view }: HttpContextContract) {
    await auth.user?.load("profil");
    return view.render("admin/dashboard/pengembalian", {
      currentUserName: auth.user?.profil.nama,
    });
  }

  public async transaksiBukuTable({ auth, view }: HttpContextContract) {
    const buku = await Buku.all();
    await auth.user?.load("profil");
    return view.render(`admin/dashboard/transaksi_buku`, {
      currentUserName: auth.user?.profil.nama,
      currentPage: "transaksi_buku",
      data: {
        buku: buku.map((b) => b.serialize({ fields: ["id", "judul"] })),
      },
    });
  }

  public async bukuForm({ request, response, view, logger, auth }: HttpContextContract) {
    const { isEditing, id } = request.qs();
    const rak = await Rak.all();

    await auth.user?.load("profil");

    if (isEditing) {
      const buku = await Buku.find(id);
      if (!buku) {
        logger.error("NOT FOUND: %o", { ctx: { id } });
        return response.redirect().back();
      }

      return view.render("admin/dashboard/buku_form", {
        currentUserName: auth.user?.profil.nama,
        rak: rak.map((r) => r.noRak),
        isEditing,
        data: {
          id: buku.id,
          isbn: buku.isbn,
          judul: buku.judul,
          pengarang: buku.pengarang,
          penerbit: buku.penerbit,
          deskripsi: buku.deskripsi,
          rak: rak.map(({ id, noRak }) => ({ id, noRak })),
        },
      });
    }

    return view.render("admin/dashboard/buku_form", {
      currentUserName: auth.user?.profil.nama,
      data: {
        rak: rak.map(({ id, noRak }) => ({ id, noRak })),
      },
    });
  }

  public async userTable({ request, view, auth }: HttpContextContract) {
    const { type } = request.params();
    await auth.user?.load("profil");
    return view.render("admin/dashboard/user", {
      currentPage: type,
      currentUserName: auth.user?.profil.nama,
      currentUserRole: auth.user?.role,
    });
  }

  public async userForm({ request, response, view, logger, auth }: HttpContextContract) {
    const { type } = request.params();
    const { isEditing, id } = request.qs();

    const majors = (await Jurusan.all()).map(({ id, nama }) => ({ id, nama }));

    if (isEditing) {
      const user = await User.find(id);
      if (!user) {
        logger.error("NOT FOUND: %o", { ctx: { id } });
        return response.redirect().back();
      }

      await user.load("profil", (profil) => profil.preload("jurusan"));
      return view.render("admin/dashboard/user_form", {
        currentUserName: user.profil.nama,
        currentPage: type,
        isEditing,
        jurusan: majors,
        data: {
          id: user.id,
          nisn: user.profil.nisn,
          email: user.email,
          nama_lengkap: user.profil.nama,
          jenis_kelamin: user.profil.jenisKelamin,
          kelas: user.profil.kelas,
          jurusan: user.profil.jurusan?.nama,
        },
      });
    }

    await auth.user!.load("profil");
    return view.render("admin/dashboard/user_form", {
      jurusan: majors,
      currentPage: type,
      currentUserName: auth.user?.profil.nama,
    });
  }

  public async jurusanTable({ view, auth }: HttpContextContract) {
    await auth.user?.load("profil");

    return view.render(`admin/dashboard/jurusan`, {
      currentPage: "jurusan",
      currentUserName: auth.user?.profil.nama,
      currentUserRole: auth.user?.role,
    });
  }

  public async rakTable({ view, auth }: HttpContextContract) {
    await auth.user?.load("profil");

    return view.render(`admin/dashboard/rak`, {
      currentPage: "rak",
      currentUserName: auth.user?.profil.nama,
      currentUserRole: auth.user?.role,
    });
  }
}
