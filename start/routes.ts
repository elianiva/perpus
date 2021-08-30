/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from "@ioc:Adonis/Core/Route";
import { schema, rules } from "@ioc:Adonis/Core/Validator";

Route.get("/", async () => "Hello, World!");

Route.get("/admin/login", async ({ view }) => {
  return view.render("admin/login");
});

Route.post("/admin/login", async ({ request, response, view }) => {
  const userSchema = schema.create({
    email: schema.string({ trim: true }, [rules.email(), rules.required()]),
    password: schema.string({ trim: true }, [rules.required()]),
  });

  try {
    const payload = await request.validate({ schema: userSchema });
    console.log(payload);
    return view.render("admin/login");
  } catch (err) {
    response.badRequest(err.messages);
  }
});

Route.get("/admin/dashboard", async ({ view }) => {
  return view.render("admin/dashboard");
});
