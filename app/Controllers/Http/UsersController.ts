import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import Profil from "App/Models/Profil";

const userSchema = schema.create({
  email: schema.string({ trim: true }, [rules.email(), rules.required()]),
  nisn: schema.string({ trim: true }, [rules.required()]),
  nama_lengkap: schema.string({ trim: true }, [rules.required()]),
  kelas: schema.number([rules.required()]),
  jurusan: schema.number([rules.required()]),
  jenis_kelamin: schema.string({ trim: true }, [rules.required()]),
  remember_me: schema.boolean.optional(),
});

export default class UsersController {
  public async create({ request, response, session }: HttpContextContract) {
    try {
      /* eslint-disable */
      const { nisn, nama_lengkap, email, kelas, jurusan, jenis_kelamin } = await request.validate({
        schema: userSchema,
      });

      const profil = await Profil.create({
        nama: nama_lengkap,
        sex: jenis_kelamin,
        nisn,
        kelas,
        idJurusan: jurusan,
      });

      await profil.related("user").create({
        email,
        password: nisn, // default, can be changed later
        idRole: 2, // anggota
      });

      session.flash({ msg: `Berhasil menambahkan anggota baru dengan email ${email}` });
      return response.redirect("/admin/dashboard/anggota/");
    } catch (err) {
      console.error(err);
      return response.badRequest(err.messages);
    }
  }

  public async update({ request, response, session }: HttpContextContract) {
    try {
      /* eslint-disable */
      const { nisn, nama_lengkap, email, kelas, jurusan, jenis_kelamin } = await request.validate({
        schema: userSchema,
      });
      const { id } = request.qs();

      const user = await User.findBy("id", id);
      if (!user) {
        session.flash({ error: `Tidak ada user dengan id ${id}` });
        return response.redirect("/admin/dashboard/anggota");
      }

      await user.load("profil");

      user.email = email;
      user.profil.nisn = nisn;
      user.profil.nama = nama_lengkap;
      user.profil.kelas = kelas;
      user.profil.idJurusan = jurusan;
      user.profil.sex = jenis_kelamin;

      await user.save();
      await user.profil.save();

      session.flash({ msg: `Berhasil memperbarui data anggota dengan email ${email}` });
      return response.redirect("/admin/dashboard/anggota");
    } catch (err) {
      console.error(err);
      return response.badRequest(err.messages);
    }
  }

  public async store({}: HttpContextContract) {}

  public async show({ response }: HttpContextContract) {
    const allUsers = await User.all();
    await Promise.all(
      allUsers.map((user) => user.load("profil", (profil) => profil.preload("jurusan")))
    );

    const data = allUsers.map((user) => ({
      id: user.id,
      nisn: user.profil.nisn,
      email: user.email,
      nama_lengkap: user.profil.nama,
      jenis_kelamin: user.profil.sex === "P" ? "Perempuan" : "Laki Laki",
      kelas: user.profil.kelas,
      jurusan: user.profil.jurusan.nama,
    }));
    return response.send({ data });
  }

  public async destroy({ request, response, session }: HttpContextContract) {
    try {
      const id = request.input("user-id");
      const user = await User.findBy("id", id);

      if (!user) {
        session.flash({ error: `Tidak ada user dengan id ${id}` });
        return response.redirect().back();
      }

      session.flash({ msg: `Anggota dengan email ${user.email} berhasil dihapus!` });
      await user.delete();

      return response.redirect().back();
    } catch (err) {
      console.error(err);
      session.flash({ error: err.message });
      return response.redirect().back();
    }
  }
}
