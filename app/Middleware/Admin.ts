import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { AuthenticationException } from "@adonisjs/auth/build/standalone";

export default class AdminMiddleware {
  public async handle({ auth }: HttpContextContract, next: () => Promise<void>) {
    if (auth!.user!.idRole !== 1) {
      throw new AuthenticationException("Unauthorized access", "E_UNAUTHORIZED_ACCESS");
    }

    await next();
  }
}
