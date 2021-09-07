import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import BukuKeluar from "App/Models/BukuKeluar";

export default class BukuKeluarsController {
  public async show({ response, session, logger }: HttpContextContract) {
    try {
      const bukuKeluar = await BukuKeluar.all();

      return {
        data: await Promise.all(
          bukuKeluar.map(async (bk) => {
            await bk.load("buku");
            return {
              id: bk.id,
              id_buku: bk.buku.id,
              judul: bk.buku.judul,
              alasan: bk.alasan,
              jumlah: bk.jumlah,
            };
          })
        ),
      };
    } catch (err) {
      logger.error("BukuMasuksController.show: %o", err.messages);
      session.flash({ error: "Error dalam sistem" });
      return response.redirect().back();
    }
  }

  public async create({ response, request, session, logger }: HttpContextContract) {
    try {
      /* eslint-disable */
      const { id_buku, alasan, jumlah } = await request.validate({
        schema: schema.create({
          id_buku: schema.number([rules.required()]),
          alasan: schema.string({ trim: true }, [rules.required()]),
          jumlah: schema.number([rules.required()]),
        }),
      });

      const bukuMasuk = await BukuKeluar.create({ idBuku: id_buku, alasan, jumlah });
      await bukuMasuk.load("buku");
      bukuMasuk.buku.jumlah = bukuMasuk.buku.jumlah + jumlah;
      bukuMasuk.buku.save();

      session.flash({ msg: `Berhasil menambahkan buku dengan alasan "${alasan}"` });
      return response.redirect().back();
    } catch (err) {
      console.error(err);
      logger.error("BukuKeluarsController.create: %o", err.messages);
      session.flash({ error: "Error dalam sistem" });
      return response.redirect().back();
    }
  }

  public async update({ response, request, session, logger }: HttpContextContract) {
    try {
      /* eslint-disable */
      const { id_buku, alasan, jumlah } = await request.validate({
        schema: schema.create({
          id_buku: schema.number([rules.required()]),
          alasan: schema.string({ trim: true }, [rules.required()]),
          jumlah: schema.number([rules.required()]),
        }),
      });

      const bukuKeluar = await BukuKeluar.findBy("id", id_buku);
      if (!bukuKeluar) {
        session.flash({ err: `Tidak ada buku keluar dengan id ${id_buku}` });
        return response.redirect().back();
      }
      await bukuKeluar.load("buku");

      bukuKeluar.alasan = alasan;
      bukuKeluar.jumlah = jumlah;
      bukuKeluar.buku.jumlah = bukuKeluar.buku.jumlah + jumlah;
      bukuKeluar.buku.save();
      bukuKeluar.save();

      session.flash({ msg: `Berhasil memperbarui buku dengan judul "${bukuKeluar.buku.judul}"` });
      return response.redirect().back();
    } catch (err) {
      logger.error("BukuKeluarsController.update: %o", err.messages);
      session.flash({ error: "Error dalam sistem" });
      return response.redirect().back();
    }
  }

  public async destroy({ response, request, session, logger }: HttpContextContract) {
    try {
      const { id_buku } = await request.validate({
        schema: schema.create({
          id_buku: schema.number([rules.required()]),
        }),
      });

      const bukuKeluar = await BukuKeluar.findBy("id", id_buku);
      if (!bukuKeluar) {
        session.flash({ err: `Tidak ada buku keluar dengan id ${id_buku}` });
        return response.redirect().back();
      }
      await bukuKeluar.load("buku");

      bukuKeluar.buku.jumlah = bukuKeluar.buku.jumlah + bukuKeluar.jumlah;
      bukuKeluar.buku.save();
      bukuKeluar.save();

      session.flash({ msg: `Berhasil memperbarui buku dengan judul "${bukuKeluar.buku.judul}"` });
      return response.redirect().back();
    } catch (err) {
      logger.error("BukuKeluarsController.destroy: %o", err.messages);
      session.flash({ error: "Error dalam sistem" });
      return response.redirect().back();
    }
  }
}
