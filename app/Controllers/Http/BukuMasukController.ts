import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import * as BukuKeluarMasuk from "./BukuKeluarMasuk";

export default class BukuMasukController {
  public async show() {
    return BukuKeluarMasuk.show(BukuKeluarMasuk.Kind.MASUK);
  }

  public static async add(params: BukuKeluarMasuk.AddParam) {
    return BukuKeluarMasuk.add(BukuKeluarMasuk.Kind.MASUK, params);
  }

  public async create(ctx: HttpContextContract) {
    return BukuKeluarMasuk.create(BukuKeluarMasuk.Kind.MASUK, ctx);
  }

  public async update(ctx: HttpContextContract) {
    return BukuKeluarMasuk.update(BukuKeluarMasuk.Kind.MASUK, ctx);
  }

  public async destroy(ctx: HttpContextContract) {
    return BukuKeluarMasuk.destroy(BukuKeluarMasuk.Kind.MASUK, ctx);
  }
}
