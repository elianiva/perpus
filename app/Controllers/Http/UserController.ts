import Application from "@ioc:Adonis/Core/Application";
import XLSX from "xlsx";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import User, { Roles } from "App/Models/User";
import Jurusan from "App/Models/Jurusan";

const base = {
  nisn: schema.string({ trim: true }, [rules.required()]),
  email: schema.string({ trim: true }, [rules.email(), rules.required()]),
  nama_lengkap: schema.string({ trim: true }, [rules.required()]),
  kelas: schema.number([rules.required()]),
  jurusan: schema.number([rules.required()]),
  jenis_kelamin: schema.number([rules.required()]),
  role: schema.enum(
    Object.values(Roles).filter((x) => typeof x !== "number"),
    [rules.required()]
  ),
};

export const userSchemaNoPass = schema.create({
  ...base,
  password: schema.string.optional({ trim: true }),
  password_repeat: schema.string.optional({ trim: true }, [rules.confirmed("password")]),
});

export const userSchema = schema.create({
  ...base,
  password: schema.string({ trim: true }, [rules.required()]),
  password_repeat: schema.string({ trim: true }, [rules.required(), rules.confirmed("password")]),
});

export default class UserController {
  public static async createUser({
    nisn,
    nama,
    email,
    jenisKelamin,
    idJurusan,
    kelas,
    password,
    role,
  }: Record<string, any>) {
    const user = await User.create({
      nama,
      email,
      password,
      role,
    });

    if (role !== Roles.ADMIN && role !== Roles.SUPERADMIN) {
      await user.related("profil").create({ jenisKelamin, nisn, kelas, idJurusan });
    }

    return user;
  }

  public async create({ request, response, session }: HttpContextContract) {
    try {
      const { type } = request.params();

      if (type === Roles.ADMIN.toLowerCase()) {
        const {
          nama_lengkap: nama,
          email,
          password,
          role,
        } = await request.validate({
          schema: schema.create({
            nama_lengkap: schema.string({ trim: true }, [rules.required()]),
            email: schema.string({ trim: true }, [rules.email(), rules.required()]),
            password: schema.string.optional({ trim: true }),
            password_repeat: schema.string.optional({ trim: true }, [rules.confirmed("password")]),
            role: schema.enum(
              Object.values(Roles).filter((x) => typeof x !== "number"),
              [rules.required()]
            ),
          }),
          messages: {
            required: "{{ field }} tidak boleh kosong!",
            maxLength: "Melebihi batas {{ options.maxLength }} karakter!",
          },
        });

        const user = await UserController.createUser({
          nama,
          email,
          password,
          role,
        });

        session.flash({ msg: `Berhasil menambahkan ${type} baru dengan email ${user.email}` });
        return response.redirect(`/admin/dashboard/${type}/`);
      }

      const {
        nisn,
        nama_lengkap: nama,
        email,
        kelas,
        jurusan: idJurusan,
        jenis_kelamin: jenisKelamin,
        password,
        role,
      } = await request.validate({
        schema: userSchema,
        messages: {
          required: "{{ field }} tidak boleh kosong!",
          maxLength: "Melebihi batas {{ options.maxLength }} karakter!",
        },
      });

      const user = await UserController.createUser({
        nisn,
        nama,
        email,
        kelas,
        idJurusan,
        jenisKelamin,
        password,
        role,
      });

      session.flash({ msg: `Berhasil menambahkan ${type} baru dengan email ${user.email}` });
      return response.redirect(`/admin/dashboard/${type}/`);
    } catch (err) {
      throw err;
    }
  }

  public async update({ request, response, session }: HttpContextContract) {
    try {
      const { type } = request.params();
      /* eslint-disable */
      const { nisn, nama_lengkap, email, kelas, jurusan, jenis_kelamin, password } =
        await request.validate({
          schema: userSchemaNoPass,
          messages: {
            required: "{{ field }} tidak boleh kosong!",
            maxLength: "Melebihi batas {{ options.maxLength }} karakter!",
          },
        });
      const { id } = request.qs();

      const user = await User.find(id);
      if (!user) {
        session.flash({ error: `Tidak ada user dengan id ${id}` });
        return response.redirect(`/admin/dashboard/${type}`);
      }

      await user.load("profil");

      user.nama = nama_lengkap;
      user.email = email;
      user.profil.nisn = nisn;
      user.profil.kelas = kelas;
      user.profil.idJurusan = jurusan;
      user.profil.jenisKelamin = jenis_kelamin;

      if (password) {
        user.password = password;
      }

      await user.save();
      await user.profil.save();

      session.flash({ msg: `Berhasil memperbarui data ${type} dengan email ${email}` });
      return response.redirect(`/admin/dashboard/${type}`);
    } catch (err) {
      throw err;
    }
  }

  public async show({ response, request, auth }: HttpContextContract) {
    try {
      const { type } = request.params();

      let allUsers: User[] | null = null;
      let data: Record<string, any> = {};
      if (type === Roles.ADMIN.toLowerCase()) {
        if (auth.user?.role === Roles.SUPERADMIN) {
          allUsers = await User.query()
            .where("role", "=", Roles.ADMIN)
            .orWhere("role", "=", Roles.SUPERADMIN);
        } else {
          allUsers = await User.query().where("role", "=", Roles.ADMIN);
        }

        data = allUsers!.map((user) => ({
          id: user.id,
          nama_lengkap: user.nama,
          email: user.email,
          role: user.role,
          created_at: user.createdAt,
          updated_at: user.updatedAt,
        }));
      } else if (type === Roles.ANGGOTA.toLowerCase()) {
        allUsers = await User.query().where("role", "=", Roles.ANGGOTA);

        // this thing is probably dangerous but i don't care im done with this
        await Promise.all(
          allUsers!.map((user) => user.load("profil", (profil) => profil.preload("jurusan")))
        );

        data = allUsers!.map((user) => ({
          id: user.id,
          nisn: user.profil.nisn,
          email: user.email,
          nama_lengkap: user.nama,
          jenis_kelamin: user.profil.jenisKelamin === 0 ? "Perempuan" : "Laki Laki",
          kelas: user.profil.kelas,
          jurusan: user.profil.jurusan?.nama || "Jurusan tidak tersedia",
          created_at: user.createdAt,
          updated_at: user.updatedAt,
        }));
      }

      return response.send({ data });
    } catch (err) {
      throw err;
    }
  }

  public async destroy({ request, response, session }: HttpContextContract) {
    try {
      const { type } = request.params();
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
      throw err;
    }
  }

  public async bulk({ request, response, session }: HttpContextContract) {
    try {
      const { excel } = await request.validate({
        schema: schema.create({
          excel: schema.file({ size: "10mb", extnames: ["xls", "xlsx"] }, [rules.required()]),
        }),
      });

      const path = Date.now() + "." + excel.extname;
      await excel.move(Application.tmpPath(), {
        name: path,
      });

      const wb = XLSX.readFile(Application.tmpPath(path));
      const sheetName = wb.SheetNames[0];
      const worksheet = wb.Sheets[sheetName];
      const data: Record<string, any> = XLSX.utils.sheet_to_json(worksheet);

      // filter unwanted data
      await Promise.all(
        data.map(async (d: Record<string, any>) => {
          if (d.role === Roles.ADMIN || d.role === Roles.SUPERADMIN) {
            await UserController.createUser(d);
            return;
          }

          const jurusan = await Jurusan.findBy("nama", d.nama_jurusan);
          await UserController.createUser({
            jenisKelamin: d.jenis_kelamin.toLowerCase() === "laki laki" ? 1 : 0,
            idJurusan: jurusan?.id ?? 0,
            ...(d as any), // I don't care anymore lmao
          });
        })
      );

      session.flash({ msg: "Data telah berhasil di-import" });
      return response.redirect().back();
    } catch (err) {
      throw err;
    }
  }
}
