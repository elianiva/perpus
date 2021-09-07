import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import Buku from "App/Models/Buku";
import BukuKeluar from "App/Models/BukuKeluar";

export default class BukuKeluarsController {
  public async show({ response, logger }: HttpContextContract) {
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
      logger.error("BukuMasuksController.create: ", err.messages);
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

      const buku = await Buku.findBy("id", id_buku);
      if (!buku) {
        session.flash({ err: `Tidak ada buku dengan id ${id_buku}` });
        return response.redirect().back();
      }

      await BukuKeluar.create({ alasan, jumlah });
      buku.jumlah = buku.jumlah + jumlah;
      buku.save();

      session.flash({ msg: `Berhasil menambahkan barang dengan alasan "${alasan}"` });
      return response.redirect().back();
    } catch (err) {
      logger.error("BukuKeluarsController.create: ", err.messages);
      return response.redirect().back();
    }
  }

  public async update({ response, request, session, logger }: HttpContextContract) {
    try {
      /* eslint-disable */
      const { id_buku_keluar, alasan, jumlah } = await request.validate({
        schema: schema.create({
          id_buku_keluar: schema.number([rules.required()]),
          alasan: schema.string({ trim: true }, [rules.required()]),
          jumlah: schema.number([rules.required()]),
        }),
      });

      const bukuKeluar = await BukuKeluar.findBy("id", id_buku_keluar);
      if (!bukuKeluar) {
        session.flash({ err: `Tidak ada buku keluar dengan id ${id_buku_keluar}` });
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
      logger.error("BukuKeluarsController.update: ", err.messages);
      return response.redirect().back();
    }
  }

  public async destroy({ response, request, session, logger }: HttpContextContract) {
    try {
      const { id_buku_keluar } = await request.validate({
        schema: schema.create({
          id_buku_keluar: schema.number([rules.required()]),
        }),
      });

      const bukuKeluar = await BukuKeluar.findBy("id", id_buku_keluar);
      if (!bukuKeluar) {
        session.flash({ err: `Tidak ada buku keluar dengan id ${id_buku_keluar}` });
        return response.redirect().back();
      }
      await bukuKeluar.load("buku");

      bukuKeluar.buku.jumlah = bukuKeluar.buku.jumlah + bukuKeluar.jumlah;
      bukuKeluar.buku.save();
      bukuKeluar.save();

      session.flash({ msg: `Berhasil memperbarui buku dengan judul "${bukuKeluar.buku.judul}"` });
      return response.redirect().back();
    } catch (err) {
      logger.error("BukuKeluarsController.update: ", err.messages);
      return response.redirect().back();
    }
  }
}
