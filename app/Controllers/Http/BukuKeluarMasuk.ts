import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import BukuKeluar from "App/Models/BukuKeluar";
import BukuKeluarMasuk from "App/Models/BukuKeluarMasuk";
import BukuMasuk from "App/Models/BukuMasuk";

export enum Kind {
  MASUK,
  KELUAR,
}

export async function show(kind: Kind) {
  let buku: BukuKeluarMasuk[] | null = null;

  if (kind === Kind.MASUK) {
    buku = await BukuMasuk.all();
  } else if (kind === Kind.KELUAR) {
    buku = await BukuKeluar.all();
  }

  return {
    data: await Promise.all(
      buku!.map(async (b: BukuKeluarMasuk) => {
        await b.load("buku");
        return {
          id: b.id,
          id_buku: b.buku.id,
          judul: b.buku.judul,
          alasan: b.alasan,
          jumlah: b.jumlah,
          created_at: b.createdAt,
          updated_at: b.updatedAt,
        };
      })
    ),
  };
}

export interface AddParam {
  id_buku: number;
  jumlah: number;
  alasan: string;
}
export async function add(kind: Kind, { id_buku, jumlah, alasan }: AddParam) {
  let buku: BukuKeluarMasuk | null = null;

  if (kind === Kind.MASUK) {
    buku = await BukuMasuk.create({ idBuku: id_buku, alasan, jumlah });
    await buku.load("buku");
    buku.buku.jumlah = buku.buku.jumlah + jumlah;
  } else if (kind === Kind.KELUAR) {
    buku = await BukuMasuk.create({ idBuku: id_buku, alasan, jumlah });
    await buku.load("buku");
    buku.buku.jumlah = buku.buku.jumlah - jumlah;
  }

  // prevents negative value
  if (buku!.buku.jumlah < 0) buku!.buku.jumlah = 0;

  await buku!.buku.save();
}

export async function create(kind: Kind, { response, request, session }: HttpContextContract) {
  /* eslint-disable */
  const { id_buku, alasan, jumlah } = await request.validate({
    schema: schema.create({
      id_buku: schema.number([rules.required()]),
      alasan: schema.string({ trim: true }, [rules.required()]),
      jumlah: schema.number([rules.required()]),
    }),
  });

  await add(kind, { id_buku, alasan, jumlah });

  session.flash({ msg: `Berhasil menambahkan buku dengan alasan "${alasan}"` });
  return response.redirect().back();
}

export async function update(kind: Kind, { response, request, session }: HttpContextContract) {
  /* eslint-disable */
  const { id_buku, alasan, jumlah } = await request.validate({
    schema: schema.create({
      id_buku: schema.number([rules.required()]),
      alasan: schema.string({ trim: true }, [rules.required()]),
      jumlah: schema.number([rules.required()]),
    }),
  });

  let buku: BukuKeluarMasuk | null = null;

  if (kind === Kind.MASUK) {
    buku = await BukuMasuk.find(id_buku);
  } else if (kind === Kind.KELUAR) {
    buku = await BukuKeluar.find(id_buku);
  }

  if (!buku) {
    session.flash({ err: `Tidak ada buku keluar dengan id ${id_buku}` });
    return response.redirect().back();
  }

  await buku.load("buku");

  buku.alasan = alasan;

  if (kind === Kind.MASUK) {
    buku.buku.jumlah = buku.buku.jumlah - buku.jumlah + jumlah;
  } else if (kind === Kind.KELUAR) {
    buku.buku.jumlah = buku.buku.jumlah - buku.jumlah;
  }

  buku.jumlah = jumlah;
  buku.buku.save();
  buku.save();

  session.flash({ msg: `Berhasil memperbarui buku dengan judul "${buku.buku.judul}"` });
  return response.redirect().back();
}

export async function destroy(kind: Kind, { response, request, session }: HttpContextContract) {
  const { id_buku } = await request.validate({
    schema: schema.create({
      id_buku: schema.number([rules.required()]),
    }),
  });

  let buku: BukuKeluarMasuk | null = null;

  if (kind === Kind.MASUK) {
    buku = await BukuMasuk.find(id_buku);
  } else if (kind === Kind.KELUAR) {
    buku = await BukuKeluar.find(id_buku);
  }

  if (!buku) {
    session.flash({ err: `Tidak ada buku keluar dengan id ${id_buku}` });
    return response.redirect().back();
  }

  await buku.load("buku");

  if (kind === Kind.MASUK) {
    buku.buku.jumlah = buku.buku.jumlah + buku.jumlah;
  } else if (kind === Kind.KELUAR) {
    buku.buku.jumlah = buku.buku.jumlah + buku.jumlah;
  }

  buku.buku.save();
  buku.save();

  session.flash({ msg: `Berhasil memperbarui buku dengan judul "${buku.buku.judul}"` });
  return response.redirect().back();
}
