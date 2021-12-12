import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import Buku from "App/Models/Buku";
import Jurusan from "App/Models/Jurusan";
import Pinjaman, { Status } from "App/Models/Pinjaman";
import Rak from "App/Models/Rak";
import User, { Roles } from "App/Models/User";

export default class DashboardController {
  public async index({ view, auth }: HttpContextContract) {
    try {
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
      const borrowed = await Database.from("pinjaman")
        .count("* as total")
        .where({ status: Status.DITERIMA });
      const returned = await Database.from("pinjaman")
        .count("* as total")
        .where({ status: Status.DIKEMBALIKAN });
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
        currentUserName: auth.user?.nama,
      });
    } catch (err) {
      throw err;
    }
  }

  public async bukuTable({ view, auth }: HttpContextContract) {
    try {
      return view.render("admin/dashboard/buku", {
        currentUserName: auth.user?.nama,
        currentUserRole: auth.user?.role,
      });
    } catch (err) {
      throw err;
    }
  }

  public async pinjamanTable({ auth, view }: HttpContextContract) {
    try {
      return view.render("admin/dashboard/pinjaman", {
        currentUserName: auth.user?.nama,
        currentUserRole: auth.user?.role,
      });
    } catch (err) {
      throw err;
    }
  }

  public async pinjamanForm({ request, response, view, logger, auth }: HttpContextContract) {
    try {
      const { isEditing, id } = request.qs();

      await auth.user?.load("profil");
      const buku = await Buku.all();
      const anggota = await User.all();
      // this thing is probably dangerous but i don't care im done with this
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
        const endDate = pinjaman.tglKembali?.toFormat("MM/dd/yyyy");

        return view.render("admin/dashboard/pinjaman_form", {
          currentUserName: auth.user?.nama,
          isEditing,
          data: {
            id,
            semuaBuku: buku.map(({ id, judul }) => ({ id, judul })),
            semuaAnggota: anggota.map(({ id, nama }) => ({ id, nama })),
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
        currentUserName: auth.user?.nama,
        data: {
          semuaBuku: buku.map(({ id, judul }) => ({ id, judul })),
          semuaAnggota: anggota.map(({ id, nama }) => ({ id, nama })),
        },
      });
    } catch (err) {
      throw err;
    }
  }

  public async transaksiBukuTable({ auth, view }: HttpContextContract) {
    try {
      const buku = await Buku.all();
      await auth.user?.load("profil");
      return view.render(`admin/dashboard/transaksi_buku`, {
        currentUserName: auth.user?.nama,
        currentPage: "transaksi_buku",
        data: {
          buku: buku.map((b) => b.serialize({ fields: ["id", "judul", "jumlah"] })),
        },
      });
    } catch (err) {
      throw err;
    }
  }

  public async bukuForm({ request, response, view, logger, auth }: HttpContextContract) {
    try {
      const { isEditing, id } = request.qs();
      const rak = await Rak.all();
      const kategori = await Database.from("buku").select("kategori").distinct();

      await auth.user?.load("profil");

      if (isEditing) {
        const buku = await Buku.find(id);
        if (!buku) {
          logger.error("NOT FOUND: %o", { ctx: { id } });
          return response.redirect().back();
        }

        return view.render("admin/dashboard/buku_form", {
          currentUserName: auth.user?.nama,
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
            kategori: buku.kategori,
          },
        });
      }

      return view.render("admin/dashboard/buku_form", {
        currentUserName: auth.user?.nama,
        data: {
          rak: rak.map(({ id, noRak }) => ({ id, noRak })),
          kategori: kategori.map(({ kategori }) => kategori),
        },
      });
    } catch (err) {
      throw err;
    }
  }

  public async userTable({ request, view, auth }: HttpContextContract) {
    try {
      const { type } = request.params();
      await auth.user?.load("profil");
      return view.render(`admin/dashboard/${type}`, {
        currentPage: type,
        currentUserName: auth.user?.nama,
        currentUserRole: auth.user?.role,
      });
    } catch (err) {
      throw err;
    }
  }

  public async userForm({ request, response, view, logger, auth }: HttpContextContract) {
    try {
      const { isEditing, id } = request.qs();

      const majors = (await Jurusan.all()).map(({ id, nama }) => ({ id, nama }));

      if (isEditing) {
        const user = await User.find(id);
        if (!user) {
          logger.error("NOT FOUND: %o", { ctx: { id } });
          return response.redirect().back();
        }

        await user.load("profil", (profil) => profil.preload("jurusan"));
        return view.render("admin/dashboard/anggota_form", {
          currentUserName: user.nama,
          isEditing,
          jurusan: majors,
          data: {
            id: user.id,
            nisn: user.profil.nisn,
            email: user.email,
            nama_lengkap: user.nama,
            jenis_kelamin: user.profil.jenisKelamin,
            kelas: user.profil.kelas,
            jurusan: user.profil.jurusan?.nama,
          },
        });
      }

      await auth.user!.load("profil");
      return view.render("admin/dashboard/anggota_form", {
        jurusan: majors,
        currentUserName: auth.user?.nama,
      });
    } catch (err) {
      throw err;
    }
  }

  public async jurusanTable({ view, auth }: HttpContextContract) {
    try {
      await auth.user?.load("profil");

      return view.render(`admin/dashboard/jurusan`, {
        currentPage: "jurusan",
        currentUserName: auth.user?.nama,
        currentUserRole: auth.user?.role,
      });
    } catch (err) {
      throw err;
    }
  }

  public async rakTable({ view, auth }: HttpContextContract) {
    try {
      await auth.user?.load("profil");

      return view.render(`admin/dashboard/rak`, {
        currentPage: "rak",
        currentUserName: auth.user?.nama,
        currentUserRole: auth.user?.role,
      });
    } catch (err) {
      throw err;
    }
  }

  public async laporanView({ view, auth }: HttpContextContract) {
    try {
      await auth.user?.load("profil");
      return view.render(`admin/dashboard/laporan`, {
        currentPage: "laporan",
        currentUserName: auth.user?.nama,
        currentUserRole: auth.user?.role,
        data: {
          tables: [
            ["buku", "Buku"],
            ["transaksi_buku", "Transaksi Buku"],
            ["pinjaman", "Peminjaman Buku"],
            ["anggota", "Anggota"],
            ["admin", "Admin"],
            ["jurusan", "Jurusan"],
            ["rak", "Rak"],
          ],
        },
      });
    } catch (err) {
      throw err;
    }
  }
}
