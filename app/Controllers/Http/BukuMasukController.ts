import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import BukuMasuk from "App/Models/BukuMasuk";

export default class BukuMasukController {
  public async show() {
    const bukuMasuk = await BukuMasuk.all();

    return {
      data: await Promise.all(
        bukuMasuk.map(async (bk) => {
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
    const bukuKeluar = await BukuMasuk.create({ idBuku: id_buku, alasan, jumlah });
    await bukuKeluar.load("buku");
    bukuKeluar.buku.jumlah = bukuKeluar.buku.jumlah + jumlah;

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

    await BukuMasukController.add({ id_buku, alasan, jumlah });

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

    const bukuMasuk = await BukuMasuk.find(id_buku);
    if (!bukuMasuk) {
      session.flash({ err: `Tidak ada buku keluar dengan id ${id_buku}` });
      return response.redirect().back();
    }
    await bukuMasuk.load("buku");

    bukuMasuk.alasan = alasan;
    bukuMasuk.buku.jumlah = bukuMasuk.buku.jumlah - bukuMasuk.jumlah + jumlah;
    bukuMasuk.jumlah = jumlah;
    bukuMasuk.buku.save();
    bukuMasuk.save();

    session.flash({ msg: `Berhasil memperbarui buku dengan judul "${bukuMasuk.buku.judul}"` });
    return response.redirect().back();
  }

  public async destroy({ response, request, session }: HttpContextContract) {
    const { id_buku } = await request.validate({
      schema: schema.create({
        id_buku: schema.number([rules.required()]),
      }),
    });

    const bukuMasuk = await BukuMasuk.findBy("id", id_buku);
    if (!bukuMasuk) {
      session.flash({ err: `Tidak ada buku keluar dengan id ${id_buku}` });
      return response.redirect().back();
    }
    await bukuMasuk.load("buku");

    bukuMasuk.buku.jumlah = bukuMasuk.buku.jumlah + bukuMasuk.jumlah;
    bukuMasuk.buku.save();
    bukuMasuk.save();

    session.flash({ msg: `Berhasil memperbarui buku dengan judul "${bukuMasuk.buku.judul}"` });
    return response.redirect().back();
  }
}
