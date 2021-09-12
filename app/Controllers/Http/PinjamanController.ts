import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Pinjaman from "App/Models/Pinjaman";

export default class PinjamenController {
  public async create({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {
    try {
      const pinjaman = await Pinjaman.all();
      return {
        data: await Promise.all(
          pinjaman.map(async (p) => {
            await p.load("buku");
            return {
              judul: p.buku[0].judul,
              status: p.status,
              tgl_pinjam: p.tglPinjam,
              tgl_kembali: p.tglKembali,
            };
          })
        ),
      };
    } catch (err) {
      console.log(err);
    }
  }

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
