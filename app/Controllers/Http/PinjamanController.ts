import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import Buku from "App/Models/Buku";
import Pinjaman from "App/Models/Pinjaman";
import { DateTime } from "luxon";
import BukuKeluarController from "./BukuKeluarController";
import BukuMasukController from "./BukuMasukController";

/**
 * Parse date from daterangepicker
 * @param {string} date - Raw date string from the input (mm/dd/yyyy - mm/dd/yyyy)
 * @return {Date}
 */
const parseDate = (date: string): { start: DateTime; end: DateTime } => {
  const [startDate, endDate] = date.split("-").map((date) => {
    const [m, d, y] = date.replace(/\//g, "-").trim().split("-");
    return new Date([y, m, d].join("-"));
  });

  return {
    start: DateTime.fromISO(startDate.toISOString()),
    end: DateTime.fromISO(endDate.toISOString()),
  };
};

export default class PinjamanController {
  public async create({ request, response, session, auth }: HttpContextContract) {
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

    if (!buku) {
      throw new Error(`Buku dengan id ${id_buku} tidak ditemukan`);
    }

    await auth.user!.load("profil");
    await BukuKeluarController.add({
      id_buku,
      jumlah: 1,
      alasan: `Dipinjam oleh ${auth.user!.profil.nama}`,
    });

    const pinjaman = await Pinjaman.create({
      idUser: id_anggota,
      tglPinjam: start,
      tglKembali: end,
    });

    await pinjaman.related("buku").attach([buku!.id]);

    session.flash({ msg: "Berhasil menambahkan pinjaman!" });
    return response.redirect("/admin/dashboard/peminjaman");
  }

  public async show({ request }: HttpContextContract) {
    let { status } = request.qs();
    status = parseInt(status);

    let pinjaman = await Pinjaman.all();
    if (status) {
      pinjaman = pinjaman.filter((p) => p.status === status);
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
  }

  public async update({ request, response, session }: HttpContextContract) {
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
  }

  public async restore({ request, response, session, auth }: HttpContextContract) {
    const { id: idPinjaman } = await request.validate({
      schema: schema.create({
        id: schema.number([rules.required()]),
      }),
    });

    const pinjaman = await Pinjaman.find(idPinjaman);

    if (!pinjaman) {
      session.flash({ error: `Tidak ada pinjaman dengan id ${idPinjaman}` });
      return response.redirect().back();
    }

    await pinjaman.load("buku");

    await auth.user!.load("profil");
    await BukuMasukController.add({
      id_buku: pinjaman.buku[0].id,
      jumlah: 1,
      alasan: `Dikembalikan oleh ${auth.user!.profil.nama}`,
    });

    pinjaman.status = 1;
    await pinjaman.save();

    session.flash({ msg: "Pinjaman berhasil dikembalikan!" });
    return response.redirect("/admin/dashboard/peminjaman");
  }

  public async destroy({ request, response, session }: HttpContextContract) {
    const { id: idPinjaman } = await request.validate({
      schema: schema.create({
        id: schema.number([rules.required()]),
      }),
    });

    const pinjaman = await Pinjaman.find(idPinjaman);
    if (!pinjaman) {
      session.flash({ msg: "Pinjaman gagal dihapus" });
      return response.redirect().back();
    }
    await pinjaman.delete();

    session.flash({ msg: "Pinjaman berhasil dihapus" });
    return response.redirect().back();
  }
}
