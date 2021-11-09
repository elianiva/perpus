import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { AuthenticationException } from "@adonisjs/auth/build/standalone";
import { Roles } from "App/Models/User";

export default class AnggotaMiddleware {
  public async handle({ auth }: HttpContextContract, next: () => Promise<void>) {
    if (auth!.user!.role !== Roles.ANGGOTA) {
      throw new AuthenticationException(
        "Unauthorized access",
        "E_UNAUTHORIZED_ACCESS",
        undefined,
        "/admin/dashboard"
      );
    }

    await next();
  }
}
