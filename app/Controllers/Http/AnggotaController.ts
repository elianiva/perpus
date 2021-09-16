import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Buku from "App/Models/Buku";

export default class AnggotaController {
  public async index({ view }: HttpContextContract) {
    const books = await Buku.all();

    return view.render("anggota/index", {
      data: {
        buku: books.filter((book) => book.jumlah > 0),
      },
    });
  }
}
