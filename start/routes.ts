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
    return response.redirect("/login");
  }
  return response.redirect("/login");
});

Route.get("/login", "LoginController.index");
Route.post("/login", "LoginController.login");
Route.post("/logout", "LoginController.logout");

Route.group(() => {
  Route.group(() => {
    Route.get("/", "DashboardController.index");
    Route.get("/jurusan", "DashboardController.jurusanTable");
    Route.get("/buku", "DashboardController.bukuTable");
    Route.get("/buku/form", "DashboardController.bukuForm");

    Route.get("/buku_masuk", "DashboardController.bukuMasukTable");
    Route.get("/buku_keluar", "DashboardController.bukuKeluarTable");

    // fall through for /anggota or /admin
    Route.get("/:type", "DashboardController.userTable");
    Route.get("/:type/form", "DashboardController.userForm");
  })
    .where("type", /(anggota|admin)/)
    .middleware("auth")
    .prefix("/dashboard");
}).prefix("/admin");

Route.group(() => {
  Route.get("/buku", "BukuController.show");
  Route.post("/buku/tambah", "BukuController.create");

  Route.get("/jurusan", "JurusanController.show");
  Route.post("/jurusan/tambah", "JurusanController.create");
  Route.put("/jurusan/perbarui", "JurusanController.update");
  Route.delete("/jurusan/hapus", "JurusanController.destroy");

  Route.get("/buku_masuk", "BukuMasukController.show");
  Route.post("/buku_masuk/tambah", "BukuMasukController.create");
  Route.put("/buku_masuk/perbarui", "BukuMasukController.update");
  Route.delete("/buku_masuk/hapus", "BukuMasukController.destroy");

  Route.get("/buku_keluar", "BukuKeluarController.show");
  Route.post("/buku_keluar/tambah", "BukuKeluarController.create");
  Route.put("/buku_keluar/perbarui", "BukuKeluarController.update");
  Route.delete("/buku_keluar/hapus", "BukuKeluarController.destroy");

  Route.group(() => {
    Route.get("/:type", "UserController.show");
    Route.post("/:type/tambah", "UserController.create");
    Route.put("/:type/edit", "UserController.update");
    Route.delete("/:type/hapus", "UserController.destroy");
  }).where("type", /(anggota|admin)/);
})
  .prefix("/api")
  .middleware("auth");
