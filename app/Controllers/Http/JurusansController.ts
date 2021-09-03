import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Jurusan from "App/Models/Jurusan";

export default class JurusansController {
  public async index({}: HttpContextContract) {}

  public async create({}: HttpContextContract) {}

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({ request, response, session, logger }: HttpContextContract) {
    try {
      const id = request.input("jurusan-id");
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
