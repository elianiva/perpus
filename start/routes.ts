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

Route.get("/", async ({ session, response }) => {
  if (!session.get("id_user")) {
    return response.redirect("/admin/login");
  }
  return response.redirect("/admin/login");
});

Route.group(() => {
  Route.get("/login", "LoginController.index");
  Route.post("/login", "LoginController.login");

  Route.post("/logout", "LoginController.logout");

  Route.group(() => {
    Route.get("/", "DashboardController.index");
    Route.get("/:type", "DashboardController.userTable");
    Route.get("/:type/form", "DashboardController.userForm");
  })
    .prefix("/dashboard")
    .where("type", /(anggota|admin)/)
    .middleware("auth");
}).prefix("/admin");

Route.group(() => {
  Route.get("/:type", "UsersController.show");
  Route.post("/:type/tambah", "UsersController.create");
  Route.put("/:type/edit", "UsersController.update");
  Route.delete("/:type/hapus", "UsersController.destroy");
})
  .where("type", /(anggota|admin)/)
  .prefix("/api")
  .middleware("auth");
