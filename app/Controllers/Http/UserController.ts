import Application from "@ioc:Adonis/Core/Application";
import XLSX from "xlsx";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import User, { Roles } from "App/Models/User";

const base = {
  email: schema.string({ trim: true }, [rules.email(), rules.required()]),
  nisn: schema.string({ trim: true }, [rules.required()]),
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
  public static async createUser({ request }: HttpContextContract) {
    /* eslint-disable */
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
    });

    const user = await User.create({
      email,
      password,
      role,
    });

    await user.related("profil").create({ nama, jenisKelamin, nisn, kelas, idJurusan });

    return user;
  }

  public async create(ctx: HttpContextContract) {
    const { type } = ctx.request.params();
    const user = await UserController.createUser(ctx);
    ctx.session.flash({ msg: `Berhasil menambahkan ${type} baru dengan email ${user.email}` });
    return ctx.response.redirect(`/admin/dashboard/${type}/`);
  }

  public async update({ request, response, session }: HttpContextContract) {
    const { type } = request.params();
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
    user.profil.jenisKelamin = jenis_kelamin;

    if (password) {
      user.password = password;
    }

    await user.save();
    await user.profil.save();

    session.flash({ msg: `Berhasil memperbarui data ${type} dengan email ${email}` });
    return response.redirect(`/admin/dashboard/${type}`);
  }

  public async show({ response, request }: HttpContextContract) {
    const { type } = request.params();

    let allUsers: User[] | null = null;
    if (type === Roles.ADMIN.toLowerCase()) {
      allUsers = await User.query()
        .where("role", "=", type === "admin" ? Roles.ADMIN : Roles.ANGGOTA)
        .orWhere("role", "=");
    } else if (type === Roles.ANGGOTA.toLowerCase()) {
      allUsers = await User.query()
        .where("role", "=", type === "admin" ? Roles.ADMIN : Roles.ANGGOTA)
        .orWhere("role", "=");
    }

    // this thing is probably dangerous but i don't care im done with this
    await Promise.all(
      allUsers!.map((user) => user.load("profil", (profil) => profil.preload("jurusan")))
    );

    const data = allUsers!.map((user) => ({
      id: user.id,
      nisn: user.profil.nisn,
      email: user.email,
      nama_lengkap: user.profil.nama,
      jenis_kelamin: user.profil.jenisKelamin === 0 ? "Perempuan" : "Laki Laki",
      kelas: user.profil.kelas,
      jurusan: user.profil.jurusan?.nama || "Jurusan tidak tersedia",
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    }));

    return response.send({ data });
  }

  public async destroy({ request, response, session }: HttpContextContract) {
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
  }

  public async bulk({ request, response, session }: HttpContextContract) {
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
    const data = XLSX.utils.sheet_to_json(worksheet);

    // TODO: finish me
    console.log(data);

    // // filter unwanted data
    // await User.createMany(
    //   await Promise.all(
    //     data.map(async ({ id, created_at, updated_at, ...fields }) => {
    //       return {
    //         ...fields,
    //       };
    //     })
    //   )
    // );

    session.flash({ msg: "Data telah berhasil di-import" });
    return response.redirect("/admin/dashboard/buku");
  }
}
