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

Route.get("/", async () => "Hello, World!");

Route.get("/admin/login", async ({ view }) => {
  return view.render("admin/login");
});

Route.post("/admin/login", "UsersController.login");

Route.get("/admin/dashboard", async ({ session, response, view }) => {
  if (!session.get("id_user")) {
    return response.redirect("/admin/login");
  }

  return view.render("admin/dashboard");
});
