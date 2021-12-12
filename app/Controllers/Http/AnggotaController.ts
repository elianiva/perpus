import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import Buku from "App/Models/Buku";
import Pinjaman from "App/Models/Pinjaman";

export default class AnggotaController {
  public async index({ view, auth }: HttpContextContract) {
    try {
      const books = await Buku.all();
      const pinjaman = await Pinjaman.query().where("id_user", "=", auth.user!.id);
      const sortedBooks = books
        .filter((book) => book.jumlah > 0)
        .map((b) => b.toJSON())
        .sort((a, b) => (a.judul < b.judul ? -1 : 1));
      const categories = await Database.query().from("buku").select("kategori").distinct();

      await auth.user!.load("profil");
      return view.render("anggota/index", {
        currentUserName: auth.user?.nama,
        currentUserId: auth.user?.id,
        data: {
          kategori: categories.map((item) => item.kategori).sort(),
          buku: sortedBooks,
          // this thing is probably dangerous but i don't care im done with this
          pinjaman: await Promise.all(
            pinjaman.map(async (p) => {
              await p.load("buku");
              return p.toJSON();
            })
          ),
        },
      });
    } catch (err) {
      throw err;
    }
  }

  public async pinjamanView({ auth, view }: HttpContextContract) {
    try {
      const pinjaman = await Pinjaman.query().where("id_user", "=", auth.user!.id);
      // this thing is probably dangerous but i don't care im done with this
      const bukuPinjaman = await Promise.all(
        pinjaman.map(async (p) => {
          await p.load("buku");
          return p.toJSON();
        })
      );
      const terlambat = bukuPinjaman.filter((b) => {
        const returnDate = new Date(b.tgl_kembali);
        const now = new Date(Date.now());

        // normalise to midnight
        returnDate.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);

        // NOTE(elianiva): set this to `>` to test the error message
        return returnDate > now;
      });

      await auth.user!.load("profil");
      return view.render("anggota/pinjaman", {
        currentUserName: auth.user?.nama,
        currentUserId: auth.user?.id,
        data: {
          pinjaman: bukuPinjaman,
          terlambat: terlambat,
        },
      });
    } catch (err) {
      throw err;
    }
  }

  public async pinjamanData({ auth }: HttpContextContract) {
    try {
      const pinjaman = await Pinjaman.query().where("id_user", "=", auth.user!.id);

      await auth.user!.load("profil");
      return {
        // this thing is probably dangerous but i don't care im done with this
        data: await Promise.all(
          pinjaman.map(async (p) => {
            await p.load("buku");
            /* eslint-disable-next-line */
            const { isbn, judul, pengarang, penerbit, deskripsi, urlCover } = p.buku[0];

            return {
              isbn,
              judul,
              pengarang,
              penerbit,
              deskripsi,
              url_cover: urlCover,
              tgl_kembali: p.tglKembali,
              status: p.status,
            };
          })
        ),
      };
    } catch (err) {
      throw err;
    }
  }

  public async kategoriView({ request, auth, view }: HttpContextContract) {
    try {
      const { kategori } = request.params();
      const books = await Buku.query().where("kategori", "=", kategori);
      const pinjaman = await Pinjaman.query().where("id_user", "=", auth.user!.id);
      const sortedBooks = books
        .filter((book) => book.jumlah > 0)
        .map((b) => b.toJSON())
        .sort((a, b) => (a.judul < b.judul ? -1 : 1));

      await auth.user!.load("profil");
      return view.render("anggota/kategori", {
        currentUserName: auth.user?.nama,
        currentUserId: auth.user?.id,
        data: {
          kategori: kategori,
          buku: sortedBooks,
          // this thing is probably dangerous but i don't care im done with this
          pinjaman: await Promise.all(
            pinjaman.map(async (p) => {
              await p.load("buku");
              return p.toJSON();
            })
          ),
        },
      });
    } catch (err) {
      throw err;
    }
  }
}
