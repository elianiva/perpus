import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import Buku from "App/Models/Buku";
import Pinjaman from "App/Models/Pinjaman";
import { DateTime } from "luxon";

type ParsedDate = { start: DateTime; end: DateTime };
/**
 * Parse date from daterangepicker
 * @param {string} date - Raw date string from the input (mm/dd/yyyy - mm/dd/yyyy)
 * @return {Date}
 */
const parseDate = (date: string): ParsedDate => {
  const [start, end] = date
    .split("-")
    .map((date) => date.replace(/\//g, "-").trim())
    .map((date) => {
      const [m, d, y] = date.split("-");
      return [y, m, d].join("-");
    });
  return {
    start: DateTime.fromISO(new Date(start).toISOString()),
    end: DateTime.fromISO(new Date(end).toISOString()),
  };
};

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

      const { start, end } = parseDate(durasi);
      const buku = await Buku.find(id_buku);
      const pinjaman = await Pinjaman.create({
        idUser: id_anggota,
        tglPinjam: start,
        tglKembali: end,
      });

      await pinjaman.related("buku").attach([buku!.id]);

      session.flash({ msg: "Berhasil menambahkan pinjaman!" });
      return response.redirect("/admin/dashboard/peminjaman");
    } catch (err) {
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
              id: p.id,
              nama: p.user.profil.nama,
              buku: {
                id: p.buku[0].id,
                judul: p.buku[0].judul,
              },
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

  public async update({ request, response, session, logger }: HttpContextContract) {
    try {
      /* eslint-disable-next-line */
      const { id_buku, id_anggota, durasi } = await request.validate({
        schema: schema.create({
          durasi: schema.string({ trim: true }, [rules.required()]),
          id_buku: schema.number([rules.required()]),
          id_anggota: schema.number([rules.required()]),
        }),
      });
      const { id: idPinjaman } = request.qs();

      const { start, end } = parseDate(durasi);
      const pinjaman = await Pinjaman.find(idPinjaman);
      if (!pinjaman) {
        session.flash({ error: `Tidak ada pinjaman dengan id ${idPinjaman}` });
        return response.redirect().back();
      }

      pinjaman.idUser = id_anggota;
      pinjaman.tglPinjam = start;
      pinjaman.tglKembali = end;

      await pinjaman.load("buku");

      // this doesn't feel right..
      pinjaman.related("buku").detach([pinjaman.buku[0].id]);
      pinjaman.related("buku").attach([id_buku]);

      await pinjaman.save();

      session.flash({ msg: "Berhasil memperbarui pinjaman!" });
      return response.redirect("/admin/dashboard/peminjaman");
    } catch (err) {
      console.error(err);
      logger.error("PinjamanController.update: %o", err.messages);
      session.flash({ err: "Kesalahan pada sistem!" });
      return response.redirect().back();
    }
  }

  public async destroy({ request, response, session, logger }: HttpContextContract) {
    const { type } = request.qs();
    try {
      /* eslint-disable */
      const { id: idPinjaman } = await request.validate({
        schema: schema.create({
          id: schema.number([rules.required()]),
        }),
      });

      const user = await Pinjaman.find(idPinjaman);

      if (!user) {
        session.flash({ error: `Tidak ada ${type} dengan id ${idPinjaman}` });
        return response.redirect().back();
      }

      await user.delete();
      session.flash({ msg: `${type} berhasil dihapus!` });

      return response.redirect().back();
    } catch (err) {
      logger.error("PinjamanController.destroy: %o", err.messages);
      session.flash({ error: "Terdapat kesalahan pada sistem" });
      return response.redirect().back();
    }
  }
}
