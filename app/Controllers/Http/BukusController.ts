import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Buku from "App/Models/Buku";

export default class BukusController {
  public async show({ response, logger }: HttpContextContract) {
    try {
      const books = await Buku.all();

      return {
        data: books.map((book) => book.toJSON()),
      };
    } catch (err) {
      console.log(err);
      logger.error("BukusController.show", err.messages);
      return response.redirect().back();
    }
  }
}
