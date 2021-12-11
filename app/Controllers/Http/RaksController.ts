import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Rak from "App/Models/Rak";
import { rules, schema } from "@ioc:Adonis/Core/Validator";

export default class RaksController {
  public async show() {
    try {
      const rak = await Rak.all();

      return {
        data: rak.map(({ id, noRak }) => ({ id, no_rak: noRak })),
      };
    } catch (err) {
      throw err;
    }
  }

  public async create({ request, response, session }: HttpContextContract) {
    /* eslint-disable */
    const { nama_rak } = await request.validate({
      schema: schema.create({
        nama_rak: schema.string({ trim: true }, [rules.required()]),
      }),
    });
    if (!nama_rak) {
      session.flash({ error: "Nama raks wajib diisi!" });
      return response.redirect().back();
    }

    await Rak.create({ noRak: nama_rak });

    session.flash({ msg: `Rak ${nama_rak} berhasil ditambahkan` });
    return response.redirect().back();
  }

  public async update({ request, response, session }: HttpContextContract) {
    /* eslint-disable */
    const { id_rak, nama_rak } = await request.validate({
      schema: schema.create({
        id_rak: schema.string({ trim: true }, [rules.required()]),
        nama_rak: schema.string({ trim: true }, [rules.required()]),
      }),
    });

    if (!nama_rak) {
      session.flash({ error: "Nama raks wajib diisi!" });
      return response.redirect().back();
    }

    const dupe = await Rak.findBy("no_rak", nama_rak);
    if (dupe) {
      session.flash({ error: "Rak sudah ada!" });
      return response.redirect().back();
    }

    const rak = await Rak.find(id_rak);
    if (!rak) {
      session.flash({ error: `Rak ${nama_rak} tidak dapat ditemukan!` });
      return response.redirect().back();
    }

    const prevName = rak.noRak;
    rak.noRak = nama_rak;
    rak.save();

    session.flash({ msg: `Rak ${prevName} berhasil diperbarui menjadi ${nama_rak}!` });
    return response.redirect().back();
  }

  public async destroy({ request, response, session }: HttpContextContract) {
    /* eslint-disable */
    const { id_rak } = await request.validate({
      schema: schema.create({
        id_rak: schema.string({ trim: true }, [rules.required()]),
      }),
    });

    const rak = await Rak.find(id_rak);

    if (!rak) {
      session.flash({ error: `Tidak ada user dengan id ${id_rak}` });
      return response.redirect().back();
    }

    await rak.delete();
    session.flash({ msg: `Rak ${rak.noRak} berhasil dihapus!` });

    return response.redirect().back();
  }
}
