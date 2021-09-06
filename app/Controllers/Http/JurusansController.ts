import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Jurusan from "App/Models/Jurusan";

export default class JurusansController {
  public async show({ response, session, logger }: HttpContextContract) {
    try {
      const jurusan = await Jurusan.all();

      return {
        data: jurusan.map(({ id, nama }) => ({ id, nama })),
      };
    } catch (err) {
      session.flash({ error: err.message });
      logger.error("JurusansController.show", err.messages);
      return response.redirect().back();
    }
  }

  public async create({ request, response, session, logger }: HttpContextContract) {
    try {
      const name = request.input("nama-jurusan");
      if (!name) {
        session.flash({ error: "Nama jurusan wajib diisi!" });
        return response.redirect().back();
      }

      await Jurusan.create({ nama: name });

      session.flash({ msg: `Jurusan ${name} berhasil ditambahkan` });
      return response.redirect().back();
    } catch (err) {
      session.flash({ error: err.message });
      logger.error("JurusansController.create: ", err.messages);
      return response.redirect().back();
    }
  }

  public async update({ request, response, session, logger }: HttpContextContract) {
    try {
      const id = request.input("id-jurusan");
      const newName = request.input("nama-jurusan");
      if (!newName) {
        session.flash({ error: "Nama jurusan wajib diisi!" });
        return response.redirect().back();
      }

      const dupe = await Jurusan.findBy("nama", newName);
      if (dupe) {
        session.flash({ error: "Jurusan sudah ada!" });
        return response.redirect().back();
      }

      const jurusan = await Jurusan.findBy("id", id);
      if (!jurusan) {
        session.flash({ error: `Jurusan ${newName} tidak dapat ditemukan!` });
        return response.redirect().back();
      }

      const prevName = jurusan.nama;
      jurusan.nama = newName;
      jurusan.save();

      session.flash({ msg: `Jurusan ${prevName} berhasil diperbarui menjadi ${newName}!` });
      return response.redirect().back();
    } catch (err) {
      session.flash({ error: err.message });
      logger.error("JurusansController.update: ", err.messages);
      return response.redirect().back();
    }
  }

  public async destroy({ request, response, session, logger }: HttpContextContract) {
    try {
      const id = request.input("id-jurusan");
      const jurusan = await Jurusan.findBy("id", id);

      if (!jurusan) {
        session.flash({ error: `Tidak ada user dengan id ${id}` });
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
