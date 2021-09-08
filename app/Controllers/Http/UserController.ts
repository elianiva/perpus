import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import User from "App/Models/User";

const userSchema = schema.create({
  email: schema.string({ trim: true }, [rules.email(), rules.required()]),
  nisn: schema.string({ trim: true }, [rules.required()]),
  nama_lengkap: schema.string({ trim: true }, [rules.required()]),
  kelas: schema.number([rules.required()]),
  jurusan: schema.number([rules.required()]),
  jenis_kelamin: schema.string({ trim: true }, [rules.required()]),
  remember_me: schema.boolean.optional(),
});

export default class UserController {
  public async create({ request, response, session, logger }: HttpContextContract) {
    try {
      // TODO(elianiva): make role changeable
      /* eslint-disable */
      const { nisn, nama_lengkap, email, kelas, jurusan, jenis_kelamin } = await request.validate({
        schema: userSchema,
      });

      const user = await User.create({
        email,
        password: nisn, // default, can be changed later
        idRole: 2, // anggota
      });

      await user.related("profil").create({
        nama: nama_lengkap,
        jenis_kelamin,
        nisn,
        kelas,
        idJurusan: jurusan,
      });

      session.flash({ msg: `Berhasil menambahkan anggota baru dengan email ${email}` });
      return response.redirect("/admin/dashboard/anggota/");
    } catch (err) {
      logger.error("UserController.create: %o", err.messages);
      session.flash({ error: "Error dalam sistem" });
      return response.badRequest({ error: err.messages });
    }
  }

  public async update({ request, response, session, logger }: HttpContextContract) {
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
      user.profil.jenis_kelamin = jenis_kelamin;

      await user.save();
      await user.profil.save();

      session.flash({ msg: `Berhasil memperbarui data anggota dengan email ${email}` });
      return response.redirect("/admin/dashboard/anggota");
    } catch (err) {
      logger.error("UserController.update: %o", err.messages);
      session.flash({ error: "Error dalam sistem" });
      return response.badRequest(err.messages);
    }
  }

  public async show({ response, request, logger }: HttpContextContract) {
    const { type } = request.params();
    try {
      const allUsers = await User.query().where("id_role", type === "admin" ? 1 : 2);
      await Promise.all(
        allUsers.map((user) => user.load("profil", (profil) => profil.preload("jurusan")))
      );

      const data = allUsers.map((user) => ({
        id: user.id,
        nisn: user.profil.nisn,
        email: user.email,
        nama_lengkap: user.profil.nama,
        jenis_kelamin: user.profil.jenis_kelamin === "P" ? "Perempuan" : "Laki Laki",
        kelas: user.profil.kelas,
        jurusan: user.profil.jurusan?.nama || "Jurusan tidak tersedia",
      }));
      return response.send({ data });
    } catch (err) {
      logger.error("UserController.show: %o", err.messages);
      return response.badRequest(err.messages);
    }
  }

  public async destroy({ request, response, session, logger }: HttpContextContract) {
    try {
      /* eslint-disable */
      const { id_user } = await request.validate({
        schema: schema.create({
          id_user: schema.number([rules.required()]),
        }),
      });

      const user = await User.findBy("id", id_user);

      if (!user) {
        session.flash({ error: `Tidak ada user dengan id ${id_user}` });
        return response.redirect().back();
      }

      await user.delete();
      session.flash({ msg: `Anggota dengan email ${user.email} berhasil dihapus!` });

      return response.redirect().back();
    } catch (err) {
      logger.error("UserController.destroy: %o", err.messages);
      session.flash({ error: "Error dalam sistem" });
      return response.redirect().back();
    }
  }
}
