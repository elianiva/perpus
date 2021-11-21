import Application from "@ioc:Adonis/Core/Application";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import { unlink } from "fs/promises";
import Buku from "App/Models/Buku";
import { ModelObject } from "@ioc:Adonis/Lucid/Orm";

const bookSchema = schema.create({
  isbn: schema.string({ trim: true }, [rules.required(), rules.maxLength(13)]),
  judul: schema.string({ trim: true }, [rules.required()]),
  kategori: schema.string({ trim: true }, [rules.required()]),
  pengarang: schema.string({ trim: true }, [rules.required()]),
  penerbit: schema.string({ trim: true }, [rules.required()]),
  deskripsi: schema.string({ trim: true }, [rules.required()]),
  cover: schema.file({ size: "2mb", extnames: ["png", "jpeg", "jpg"] }, [rules.required()]),
  pdf: schema.file({ size: "10mb", extnames: ["pdf"] }, [rules.required()]),
  id_rak: schema.number([rules.required()]),
});

export default class BukuController {
  public async show({ request }: HttpContextContract) {
    const noEmpty = request.qs().noEmpty === "true";

    const books = await Promise.all(
      (
        await Buku.all()
      ).map(async (book) => {
        await book.load("rak");
        const json = book.toJSON();
        return {
          ...json,
          url_cover: json.url_cover.startsWith("http")
            ? json.url_cover
            : `/img/buku/${json.url_cover}`,
        } as ModelObject;
      })
    );

    return {
      data: noEmpty ? books.filter((book) => book.jumlah > 0) : books,
    };
  }

  public async create({ request, response, session }: HttpContextContract) {
    /* eslint-disable-next-line */
    const {
      isbn,
      judul,
      kategori,
      pengarang,
      deskripsi,
      penerbit,
      cover,
      pdf,
      id_rak: idRak,
    } = await request.validate({
      schema: bookSchema,
      messages: {
        required: "{{ field }} tidak boleh kosong!",
        maxLength: "Melebihi batas {{ options.maxLength }} karakter!",
      },
    });

    // save the cover image
    const imgName = `${isbn}.${cover.extname}`;
    await cover.move(Application.publicPath("img/buku"), {
      name: imgName,
    });

    // save the cover image
    const pdfName = `${isbn}.${pdf.extname}`;
    await pdf.move(Application.publicPath("pdf/buku"), {
      name: pdfName,
    });

    await Buku.create({
      isbn,
      judul,
      kategori,
      pengarang,
      penerbit,
      deskripsi,
      jumlah: 0,
      idRak,
      urlCover: imgName,
      urlPdf: pdfName,
    });

    session.flash({ msg: `Buku berjudul ${judul} berhasil ditambahkan` });
    return response.redirect("/admin/dashboard/buku");
  }

  public async destroy({ request, response, session }: HttpContextContract) {
    /* eslint-disable-next-line */
    const { id_buku } = await request.validate({
      schema: schema.create({
        id_buku: schema.number([rules.required()]),
      }),
    });

    const buku = await Buku.find(id_buku);
    if (!buku) {
      session.flash({ error: `Tidak ada buku dengan id ${id_buku}` });
      return response.redirect().back();
    }

    await buku.delete();
    session.flash({ msg: `Buku ${buku.judul} berhasil dihapus!` });

    return response.redirect().back();
  }

  public async update({ request, response, session }: HttpContextContract) {
    /* eslint-disable-next-line */
    const {
      isbn,
      cover,
      judul,
      kategori,
      penerbit,
      deskripsi,
      pengarang,
      id_rak: idRak,
    } = await request.validate({
      schema: bookSchema,
    });
    const { id } = request.qs();

    const buku = await Buku.find(id);
    if (!buku) {
      session.flash({ error: `Tidak ada buku dengan id ${id}` });
      return response.redirect().back();
    }

    buku.isbn = isbn;
    buku.judul = judul;
    buku.kategori = kategori;
    buku.pengarang = pengarang;
    buku.penerbit = penerbit;
    buku.deskripsi = deskripsi;
    buku.idRak = idRak;

    if (cover) {
      // remove the old one
      await unlink(Application.publicPath(`img/buku/${buku.urlCover}`));

      // save the file
      const filename = `${isbn}.${cover.extname}`;
      await cover.move(Application.publicPath("img/buku"), {
        name: filename,
      });
      buku.urlCover = filename;
    }

    await buku.save();
    session.flash({ msg: `Buku ${buku.judul} berhasil diperbarui!` });

    return response.redirect("/admin/dashboard/buku");
  }
}
