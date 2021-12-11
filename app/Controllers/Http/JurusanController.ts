import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Jurusan from "App/Models/Jurusan";
import { rules, schema } from "@ioc:Adonis/Core/Validator";

export default class JurusanController {
  public async show() {
    try {
      const jurusan = await Jurusan.all();

      return {
        data: jurusan.map(({ id, nama }) => ({ id, nama })),
      };
    } catch (err) {
      throw err;
    }
  }

  public async create({ request, response, session }: HttpContextContract) {
    try {
      /* eslint-disable */
      const { nama_jurusan } = await request.validate({
        schema: schema.create({
          nama_jurusan: schema.string({ trim: true }, [rules.required()]),
        }),
      });
      if (!nama_jurusan) {
        session.flash({ error: "Nama jurusan wajib diisi!" });
        return response.redirect().back();
      }

      await Jurusan.create({ nama: nama_jurusan });

      session.flash({ msg: `Jurusan ${nama_jurusan} berhasil ditambahkan` });
      return response.redirect().back();
    } catch (err) {
      throw err;
    }
  }

  public async update({ request, response, session }: HttpContextContract) {
    try {
      /* eslint-disable */
      const { id_jurusan, nama_jurusan } = await request.validate({
        schema: schema.create({
          id_jurusan: schema.string({ trim: true }, [rules.required()]),
          nama_jurusan: schema.string({ trim: true }, [rules.required()]),
        }),
      });

      if (!nama_jurusan) {
        session.flash({ error: "Nama jurusan wajib diisi!" });
        return response.redirect().back();
      }

      const dupe = await Jurusan.findBy("nama", nama_jurusan);
      if (dupe) {
        session.flash({ error: "Jurusan sudah ada!" });
        return response.redirect().back();
      }

      const jurusan = await Jurusan.find(id_jurusan);
      if (!jurusan) {
        session.flash({ error: `Jurusan ${nama_jurusan} tidak dapat ditemukan!` });
        return response.redirect().back();
      }

      const prevName = jurusan.nama;
      jurusan.nama = nama_jurusan;
      jurusan.save();

      session.flash({ msg: `Jurusan ${prevName} berhasil diperbarui menjadi ${nama_jurusan}!` });
      return response.redirect().back();
    } catch (err) {
      throw err;
    }
  }

  public async destroy({ request, response, session }: HttpContextContract) {
    try {
      /* eslint-disable */
      const { id_jurusan } = await request.validate({
        schema: schema.create({
          id_jurusan: schema.string({ trim: true }, [rules.required()]),
        }),
      });

      const jurusan = await Jurusan.find(id_jurusan);

      if (!jurusan) {
        session.flash({ error: `Tidak ada user dengan id ${id_jurusan}` });
        return response.redirect().back();
      }

      await jurusan.delete();
      session.flash({ msg: `Jurusan ${jurusan.nama} berhasil dihapus!` });

      return response.redirect().back();
    } catch (err) {
      throw err;
    }
  }
}
