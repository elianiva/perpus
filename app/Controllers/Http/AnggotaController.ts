import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class AnggotaController {
  public async index({ view }: HttpContextContract) {
    return view.render("anggota/index");
  }
}
