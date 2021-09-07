import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import BukuMasuk from "App/Models/BukuMasuk";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import Buku from "App/Models/Buku";

export default class BukuMasuksController {
  public async show({ response, logger }: HttpContextContract) {
    try {
      const bukuMasuk = await BukuMasuk.all();

      return {
        data: await Promise.all(
          bukuMasuk.map(async (bm) => {
            await bm.load("buku");
            return {
              id: bm.id,
              id_buku: bm.buku.id,
              judul: bm.buku.judul,
              alasan: bm.alasan,
              jumlah: bm.jumlah,
            };
          })
        ),
      };
    } catch (err) {
      logger.error("BukuKeluarsController.create: ", err.messages);
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

      await BukuMasuk.create({ alasan, jumlah });
      buku.jumlah = buku.jumlah + jumlah;
      buku.save();

      session.flash({ msg: `Berhasil menambahkan barang dengan alasan "${alasan}"` });
      return response.redirect().back();
    } catch (err) {
      logger.error("BukuMasuksController.create: ", err.messages);
      return response.redirect().back();
    }
  }

  public async update({ response, request, session, logger }: HttpContextContract) {
    try {
      /* eslint-disable */
      const { id_buku_masuk, alasan, jumlah } = await request.validate({
        schema: schema.create({
          id_buku_masuk: schema.number([rules.required()]),
          alasan: schema.string({ trim: true }, [rules.required()]),
          jumlah: schema.number([rules.required()]),
        }),
      });

      const bukuMasuk = await BukuMasuk.findBy("id", id_buku_masuk);
      if (!bukuMasuk) {
        session.flash({ err: `Tidak ada buku masuk dengan id ${id_buku_masuk}` });
        return response.redirect().back();
      }
      await bukuMasuk.load("buku");

      bukuMasuk.alasan = alasan;
      bukuMasuk.jumlah = jumlah;
      bukuMasuk.buku.jumlah = bukuMasuk.buku.jumlah + jumlah;
      bukuMasuk.buku.save();
      bukuMasuk.save();

      session.flash({ msg: `Berhasil memperbarui buku dengan judul "${bukuMasuk.buku.judul}"` });
      return response.redirect().back();
    } catch (err) {
      logger.error("BukuMasuksController.update: ", err.messages);
      return response.redirect().back();
    }
  }

  public async destroy({ response, request, session, logger }: HttpContextContract) {
    try {
      const { id_buku_masuk } = await request.validate({
        schema: schema.create({
          id_buku_masuk: schema.number([rules.required()]),
        }),
      });

      const bukuMasuk = await BukuMasuk.findBy("id", id_buku_masuk);
      if (!bukuMasuk) {
        session.flash({ err: `Tidak ada buku masuk dengan id ${id_buku_masuk}` });
        return response.redirect().back();
      }
      await bukuMasuk.load("buku");

      bukuMasuk.buku.jumlah = bukuMasuk.buku.jumlah + bukuMasuk.jumlah;
      bukuMasuk.buku.save();
      bukuMasuk.save();

      session.flash({ msg: `Berhasil memperbarui buku dengan judul "${bukuMasuk.buku.judul}"` });
      return response.redirect().back();
    } catch (err) {
      logger.error("BukuMasuksController.update: ", err.messages);
      return response.redirect().back();
    }
  }
}
