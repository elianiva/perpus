import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import Buku from "App/Models/Buku";
import Pinjaman from "App/Models/Pinjaman";
import { DateTime } from "luxon";

export default class PinjamanController {
  public async create({ request, response, session, logger }: HttpContextContract) {
    try {
      /* eslint-disable-next-line */
      const { id_buku, id_anggota, durasi } = await request.validate({
        schema: schema.create({
          durasi: schema.string({ trim: true }, [rules.required()]),
          id_buku: schema.number([rules.required()]),
          id_anggota: schema.number([rules.required()]),
        }),
      });
      const [startDate, endDate] = durasi
        .split("-")
        .map((date) => date.replace(/\//g, "-").trim())
        .map((date) => {
          const [m, d, y] = date.split("-");
          return [y, m, d].join("-");
        });

      const buku = await Buku.find(id_buku);
      const pinjaman = await Pinjaman.create({
        idUser: id_anggota,
        tglPinjam: DateTime.fromISO(new Date(startDate).toISOString()),
        tglKembali: DateTime.fromISO(new Date(endDate).toISOString()),
      });

      await pinjaman.related("buku").attach([buku!.id]);

      session.flash({ msg: "Berhasil menambahkan pinjaman!" });
      return response.redirect("/admin/dashboard/peminjaman");
    } catch (err) {
      console.error(err);
      logger.error("PinjamanController.create: %o", err.messages);
      session.flash({ err: "Kesalahan pada sistem!" });
      return response.redirect().back();
    }
  }

  public async show({ request, response, session, logger }: HttpContextContract) {
    try {
      const { status } = request.qs();

      let pinjaman = await Pinjaman.all();
      if (status) {
        pinjaman = pinjaman.filter((p) => p.status === parseInt(status));
      }

      return {
        data: await Promise.all(
          pinjaman.map(async (p) => {
            await p.load("buku");
            await p.load("user", (user) => user.preload("profil"));
            return {
              nama: p.user.profil.nama,
              buku: p.buku.map(({ id, judul }) => ({ id, judul })),
              status: p.status,
              tgl_pinjam: p.tglPinjam,
              tgl_kembali: p.tglKembali,
            };
          })
        ),
      };
    } catch (err) {
      logger.error("PinjamanController.show: %o", err.messages);
      session.flash({ err: "Kesalahan pada sistem!" });
      return response.redirect().back();
    }
  }

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
