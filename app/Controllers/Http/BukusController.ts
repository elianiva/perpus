import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";

export default class BukusController {
  public async show({ response, logger }: HttpContextContract) {
    try {
      const books = await Database.from("buku")
        .select("id", "isbn", "judul", "pengarang", "penerbit", "jumlah", "deskripsi", "url_cover")
        .groupBy("id")
        .count("* as total");

      console.log(books[0].total);

      return {
        total: books[0].total,
        // data: books.map((book) => book.toJSON()),
      };
    } catch (err) {
      console.log(err);
      logger.error("BukusController.show", err.messages);
      return response.redirect().back();
    }
  }
}
