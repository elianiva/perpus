import Application from "@ioc:Adonis/Core/Application";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import Database from "@ioc:Adonis/Lucid/Database";
import User, { Roles } from "App/Models/User";
import XLSX from "xlsx";

export default class LaporansController {
  public async create({ request, response }: HttpContextContract) {
    try {
      const {
        nama_table: tableName,
        tgl_awal: tglAwal,
        tgl_akhir: tglAkhir,
      } = await request.validate({
        schema: schema.create({
          nama_table: schema.string({ trim: true }, [rules.required()]),
          tgl_awal: schema.string({ trim: true }, [rules.required()]),
          tgl_akhir: schema.string({ trim: true }, [rules.required()]),
        }),
      });

      const startDate = new Date(tglAwal).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const endDate = new Date(tglAkhir).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      let result: any[];
      if (tableName === "admin") {
        const data = await User.query()
          .where("role", Roles.ADMIN)
          .orWhere("role", Roles.SUPERADMIN);
        result = data.map((u) => u.toJSON());
      } else if (tableName === "anggota") {
        const data = await User.all();
        await Promise.all(
          data.map((u) => u.load("profil", async (p) => await p.preload("jurusan")))
        );
        result = data
          .map((u) => u.toJSON())
          .map(
            ({
              id,
              created_at,
              updated_at,
              profil: {
                nisn,
                nama,
                jenis_kelamin,
                id_user,
                id_jurusan,
                jurusan: { nama: namaJurusan },
                ...pRest
              },
              ...rest
            }) => ({
              id,
              nisn,
              nama,
              jenis_kelamin: jenis_kelamin === 1 ? "Laki Laki" : "Perempuan",
              jurusan: namaJurusan,
              ...rest,
              ...pRest,
              created_at,
              updated_at,
            })
          );
      } else {
        const data = await Database.from(tableName).select("*");
        result = data.map(({ ...item }) => ({ ...item }));
      }

      const workbook = XLSX.utils.book_new();
      workbook.Props = {
        Title: `Laporan ${tableName} | ${startDate} - ${endDate}`,
        Subject: "Laporan Perpustakaan",
        Author: "Perpustakaan",
        CreatedDate: new Date(Date.now()),
      };

      const worksheet = XLSX.utils.json_to_sheet(result);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Perpustakaan");

      const filepath = Application.tmpPath(`laporan_${tableName}_${tglAwal}-${tglAkhir}.xlsx`);
      XLSX.writeFile(workbook, filepath, { type: "binary" });

      return response.attachment(filepath);
    } catch (err) {
      throw err;
    }
  }
}
