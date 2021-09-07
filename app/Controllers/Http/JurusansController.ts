import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Jurusan from "App/Models/Jurusan";
import { rules, schema } from "@ioc:Adonis/Core/Validator";

export default class JurusansController {
  public async show({ response, session, logger }: HttpContextContract) {
    try {
      const jurusan = await Jurusan.all();

      return {
        data: jurusan.map(({ id, nama }) => ({ id, nama })),
      };
    } catch (err) {
      session.flash({ error: err.message });
      logger.error("JurusansController.show: ", err.messages);
      return response.redirect().back();
    }
  }

  public async create({ request, response, session, logger }: HttpContextContract) {
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
      session.flash({ error: err.message });
      logger.error("JurusansController.create: ", err.messages);
      return response.redirect().back();
    }
  }

  public async update({ request, response, session, logger }: HttpContextContract) {
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

      const jurusan = await Jurusan.findBy("id", id_jurusan);
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
      session.flash({ error: err.message });
      logger.error("JurusansController.update: ", err.messages);
      return response.redirect().back();
    }
  }

  public async destroy({ request, response, session, logger }: HttpContextContract) {
    try {
      /* eslint-disable */
      const { id_jurusan } = await request.validate({
        schema: schema.create({
          id_jurusan: schema.string({ trim: true }, [rules.required()]),
        }),
      });

      const jurusan = await Jurusan.findBy("id", id_jurusan);

      if (!jurusan) {
        session.flash({ error: `Tidak ada user dengan id ${id_jurusan}` });
        return response.redirect().back();
      }

      await jurusan.delete();
      session.flash({ msg: `Jurusan ${jurusan.nama} berhasil dihapus!` });

      return response.redirect().back();
    } catch (err) {
      session.flash({ error: err.message });
      logger.error("JurusansController.destroy: ", err.messages);
      return response.redirect().back();
    }
  }
}
