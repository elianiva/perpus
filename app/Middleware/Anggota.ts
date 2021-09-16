import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { AuthenticationException } from "@adonisjs/auth/build/standalone";

export default class AnggotaMiddleware {
  public async handle({ auth }: HttpContextContract, next: () => Promise<void>) {
    if (auth!.user!.idRole !== 2) {
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
