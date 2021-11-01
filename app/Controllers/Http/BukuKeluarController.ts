import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import BukuKeluar from "App/Models/BukuKeluar";

export default class BukuKeluarController {
  public async show() {
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
  }

  public static async add({ id_buku, jumlah, alasan }) {
    const bukuKeluar = await BukuKeluar.create({ idBuku: id_buku, alasan, jumlah });
    await bukuKeluar.load("buku");
    bukuKeluar.buku.jumlah = bukuKeluar.buku.jumlah - jumlah;

    // prevents negative value
    if (bukuKeluar.buku.jumlah < 0) bukuKeluar.buku.jumlah = 0;

    await bukuKeluar.buku.save();
  }

  public async create({ response, request, session }: HttpContextContract) {
    /* eslint-disable */
    const { id_buku, alasan, jumlah } = await request.validate({
      schema: schema.create({
        id_buku: schema.number([rules.required()]),
        alasan: schema.string({ trim: true }, [rules.required()]),
        jumlah: schema.number([rules.required()]),
      }),
    });

    await BukuKeluarController.add({ id_buku, jumlah, alasan });

    session.flash({ msg: `Berhasil menambahkan buku dengan alasan "${alasan}"` });
    return response.redirect().back();
  }

  public async update({ response, request, session }: HttpContextContract) {
    /* eslint-disable */
    const { id_buku, alasan, jumlah } = await request.validate({
      schema: schema.create({
        id_buku: schema.number([rules.required()]),
        alasan: schema.string({ trim: true }, [rules.required()]),
        jumlah: schema.number([rules.required()]),
      }),
    });

    const bukuKeluar = await BukuKeluar.find(id_buku);
    if (!bukuKeluar) {
      session.flash({ err: `Tidak ada buku keluar dengan id ${id_buku}` });
      return response.redirect().back();
    }
    await bukuKeluar.load("buku");

    bukuKeluar.alasan = alasan;
    bukuKeluar.buku.jumlah = bukuKeluar.buku.jumlah - bukuKeluar.jumlah + jumlah;
    bukuKeluar.jumlah = jumlah;
    await bukuKeluar.buku.save();
    await bukuKeluar.save();

    session.flash({ msg: `Berhasil memperbarui buku dengan judul "${bukuKeluar.buku.judul}"` });
    return response.redirect().back();
  }

  public async destroy({ response, request, session }: HttpContextContract) {
    const { id_buku } = await request.validate({
      schema: schema.create({
        id_buku: schema.number([rules.required()]),
      }),
    });

    const bukuKeluar = await BukuKeluar.find(id_buku);
    if (!bukuKeluar) {
      session.flash({ err: `Tidak ada buku keluar dengan id ${id_buku}` });
      return response.redirect().back();
    }
    await bukuKeluar.load("buku");

    bukuKeluar.buku.jumlah = bukuKeluar.buku.jumlah - bukuKeluar.jumlah;
    await bukuKeluar.buku.save();
    await bukuKeluar.save();

    session.flash({ msg: `Berhasil memperbarui buku dengan judul "${bukuKeluar.buku.judul}"` });
    return response.redirect().back();
  }
}
