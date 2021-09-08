import Application from "@ioc:Adonis/Core/Application";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import Buku from "App/Models/Buku";

export default class BukuController {
  public async show({ response, logger }: HttpContextContract) {
    try {
      const books = await Buku.all();

      return {
        data: books.map((book) => book.toJSON()),
      };
    } catch (err) {
      logger.error("BukuController.show: %o", err.messages);
      return response.redirect().back();
    }
  }

  public async create({ request, response, session, logger }: HttpContextContract) {
    try {
      const { isbn, judul, pengarang, deskripsi, penerbit, cover } = await request.validate({
        schema: schema.create({
          isbn: schema.string({ trim: true }, [rules.required(), rules.maxLength(13)]),
          judul: schema.string({ trim: true }, [rules.required()]),
          pengarang: schema.string({ trim: true }, [rules.required()]),
          penerbit: schema.string({ trim: true }, [rules.required()]),
          deskripsi: schema.string({ trim: true }, [rules.required()]),
          cover: schema.file({ size: "2mb", extnames: ["png", "jpeg", "jpg"] }),
        }),
      });

      // save the file
      const filename = `${isbn}.${cover.extname}`;
      await cover.move(Application.publicPath("img/buku"), {
        name: filename,
      });

      await Buku.create({
        isbn,
        judul,
        pengarang,
        penerbit,
        deskripsi,
        jumlah: 0,
        url_cover: filename,
      });

      session.flash({ msg: `Buku berjudul ${judul} berhasil ditambahkan` });
      return response.redirect("/admin/dashboard/buku");
    } catch (err) {
      session.flash({ error: "Kesalahan dalam sistem" });
      logger.error("BukuController.show: %o", err.messages);
      return response.redirect().back();
    }
  }
}
