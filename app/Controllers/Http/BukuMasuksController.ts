import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class BukuMasuksController {
  public async create({ response, request }: HttpContextContract) {
    try {
      const alasan = request.input("alasan");
      console.log(alasan);
    } catch (err) {
      return response.redirect().back();
    }
  }
}
