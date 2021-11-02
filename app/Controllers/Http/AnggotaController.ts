import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Buku from "App/Models/Buku";
import Pinjaman from "App/Models/Pinjaman";

export default class AnggotaController {
  public async index({ view, auth }: HttpContextContract) {
    const books = await Buku.all();
    const pinjaman = await Pinjaman.query().where("id_user", "=", auth.user!.id);

    await auth.user!.load("profil");
    return view.render("anggota/index", {
      currentUserName: auth.user!.profil.nama,
      currentUserId: auth.user!.id,
      data: {
        buku: books.filter((book) => book.jumlah > 0),
        pinjaman: await Promise.all(
          pinjaman.map(async (p) => {
            await p.load("buku");
            return p.toJSON();
          })
        ),
      },
    });
  }

  public async pinjamanView({ auth, view }: HttpContextContract) {
    const pinjaman = await Pinjaman.query().where("id_user", "=", auth.user!.id);

    await auth.user!.load("profil");
    return view.render("anggota/pinjaman", {
      currentUserName: auth.user!.profil.nama,
      currentUserId: auth.user!.id,
      data: {
        pinjaman: await Promise.all(
          pinjaman.map(async (p) => {
            await p.load("buku");
            return p.toJSON();
          })
        ),
      },
    });
  }

  public async pinjamanData({ auth }: HttpContextContract) {
    const pinjaman = await Pinjaman.query().where("id_user", "=", auth.user!.id);

    await auth.user!.load("profil");
    return {
      data: await Promise.all(
        pinjaman.map(async (p) => {
          await p.load("buku");
          /* eslint-disable-next-line */
          const { isbn, judul, pengarang, penerbit, deskripsi, url_cover } = p.buku[0];

          return {
            isbn,
            judul,
            pengarang,
            penerbit,
            deskripsi,
            url_cover,
            tgl_kembali: p.tglKembali,
            status: p.status,
          };
        })
      ),
    };
  }
}
