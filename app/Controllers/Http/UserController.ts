import Hash from "@ioc:Adonis/Core/Hash";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import User from "App/Models/User";

export const userSchemaNoPass = schema.create({
  email: schema.string({ trim: true }, [rules.email(), rules.required()]),
  nisn: schema.string({ trim: true }, [rules.required()]),
  password: schema.string.optional({ trim: true }),
  password_repeat: schema.string.optional({ trim: true }, [rules.confirmed("password")]),
  nama_lengkap: schema.string({ trim: true }, [rules.required()]),
  kelas: schema.number([rules.required()]),
  jurusan: schema.number([rules.required()]),
  jenis_kelamin: schema.string({ trim: true }, [rules.required()]),
  role: schema.number([rules.required()]),
});

export const userSchema = schema.create({
  email: schema.string({ trim: true }, [rules.email(), rules.required()]),
  nisn: schema.string({ trim: true }, [rules.required()]),
  password: schema.string({ trim: true }, [rules.required()]),
  password_repeat: schema.string({ trim: true }, [rules.required(), rules.confirmed("password")]),
  nama_lengkap: schema.string({ trim: true }, [rules.required()]),
  kelas: schema.number([rules.required()]),
  jurusan: schema.number([rules.required()]),
  jenis_kelamin: schema.string({ trim: true }, [rules.required()]),
  role: schema.number([rules.required()]),
});

export default class UserController {
  public static async createUser({ request }: HttpContextContract) {
    /* eslint-disable */
    const {
      nisn,
      nama_lengkap: nama,
      email,
      kelas,
      jurusan: idJurusan,
      jenis_kelamin,
      password,
      role: idRole,
    } = await request.validate({
      schema: userSchema,
    });

    const user = await User.create({
      email,
      password,
      idRole,
    });

    await user.related("profil").create({ nama, jenis_kelamin, nisn, kelas, idJurusan });

    return user;
  }

  public async create(ctx: HttpContextContract) {
    const { type } = ctx.request.params();
    try {
      const user = await UserController.createUser(ctx);
      ctx.session.flash({ msg: `Berhasil menambahkan ${type} baru dengan email ${user.email}` });
      return ctx.response.redirect(`/admin/dashboard/${type}/`);
    } catch (err) {
      ctx.logger.error("UserController.create: %o", err.messages);
      ctx.session.flash({ error: "Terdapat kesalahan pada sistem" });
      return ctx.response.badRequest({ error: err.messages });
    }
  }

  public async update({ request, response, session, logger }: HttpContextContract) {
    const { type } = request.params();
    try {
      /* eslint-disable */
      const { nisn, nama_lengkap, email, kelas, jurusan, jenis_kelamin, password } =
        await request.validate({
          schema: userSchemaNoPass,
        });
      const { id } = request.qs();

      const user = await User.find(id);
      if (!user) {
        session.flash({ error: `Tidak ada user dengan id ${id}` });
        return response.redirect(`/admin/dashboard/${type}`);
      }

      await user.load("profil");

      user.email = email;
      user.profil.nisn = nisn;
      user.profil.nama = nama_lengkap;
      user.profil.kelas = kelas;
      user.profil.idJurusan = jurusan;
      user.profil.jenis_kelamin = jenis_kelamin;

      console.log(password);
      if (password) {
        user.password = await Hash.make(password);
        console.log(user.password);
      }

      await user.save();
      await user.profil.save();

      session.flash({ msg: `Berhasil memperbarui data ${type} dengan email ${email}` });
      return response.redirect(`/admin/dashboard/${type}`);
    } catch (err) {
      logger.error("UserController.update: %o", err.messages);
      session.flash({ error: "Terdapat kesalahan pada sistem" });
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
    const { type } = request.params();
    try {
      /* eslint-disable */
      const { id_user } = await request.validate({
        schema: schema.create({
          id_user: schema.number([rules.required()]),
        }),
      });

      const user = await User.find(id_user);

      if (!user) {
        session.flash({ error: `Tidak ada user dengan id ${id_user}` });
        return response.redirect().back();
      }

      await user.delete();
      session.flash({ msg: `${type} dengan email ${user.email} berhasil dihapus!` });

      return response.redirect().back();
    } catch (err) {
      logger.error("UserController.destroy: %o", err.messages);
      session.flash({ error: "Terdapat kesalahan pada sistem" });
      return response.redirect().back();
    }
  }
}
