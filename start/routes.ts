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
  Route.get("/", "AnggotaController.index");
  Route.get("/peminjaman", "AnggotaController.pinjamanView");
})
  .prefix("/anggota")
  .middleware(["auth", "anggota"]);

Route.group(() => {
  Route.group(() => {
    Route.get("/", "DashboardController.index");
    Route.get("/jurusan", "DashboardController.jurusanTable");
    Route.get("/rak", "DashboardController.rakTable");
    Route.get("/buku", "DashboardController.bukuTable");
    Route.get("/buku/form", "DashboardController.bukuForm");

    Route.get("/transaksi_buku", "DashboardController.transaksiBukuTable");

    Route.get("/peminjaman", "DashboardController.pinjamanTable");
    Route.get("/peminjaman/form", "DashboardController.pinjamanForm");

    Route.get("/pengembalian", "DashboardController.kembaliTable");

    // fall through for /anggota or /admin
    Route.get("/:type", "DashboardController.userTable");
    Route.get("/:type/form", "DashboardController.userForm");
  })
    .where("type", /(anggota|admin)/)
    .prefix("/dashboard");
})
  .prefix("/admin")
  .middleware(["auth", "admin"]);

Route.group(() => {
  Route.get("/buku", "BukuController.show");
  Route.post("/buku/tambah", "BukuController.create");
  Route.put("/buku/edit", "BukuController.update");
  Route.delete("/buku/hapus", "BukuController.destroy").middleware(["superadmin"]);

  Route.get("/jurusan", "JurusanController.show");
  Route.post("/jurusan/tambah", "JurusanController.create");
  Route.put("/jurusan/edit", "JurusanController.update");
  Route.delete("/jurusan/hapus", "JurusanController.destroy").middleware(["superadmin"]);

  Route.get("/rak", "RaksController.show");
  Route.post("/rak/tambah", "RaksController.create");
  Route.put("/rak/edit", "RaksController.update");
  Route.delete("/rak/hapus", "RaksController.destroy").middleware(["superadmin"]);

  Route.get("/transaksi_buku", "TransaksiBukuController.show");
  Route.post("/transaksi_buku/tambah", "TransaksiBukuController.create");
  Route.put("/transaksi_buku/edit", "TransaksiBukuController.update");
  Route.delete("/transaksi_buku/hapus", "TransaksiBukuController.destroy").middleware([
    "superadmin",
  ]);

  Route.get("/peminjaman", "PinjamanController.show");
  Route.post("/peminjaman/tambah", "PinjamanController.create");
  Route.put("/peminjaman/edit", "PinjamanController.update");
  Route.delete("/peminjaman/hapus", "PinjamanController.destroy").middleware(["superadmin"]);
  Route.put("/peminjaman/kembali", "PinjamanController.restore");

  Route.get("/anggota/peminjaman", "AnggotaController.pinjamanData");

  // fall through for /anggota or /admin
  Route.group(() => {
    Route.get("/:type", "UserController.show");
    Route.post("/:type/tambah", "UserController.create");
    Route.put("/:type/edit", "UserController.update");
    Route.delete("/:type/hapus", "UserController.destroy").middleware(["superadmin"]);
  }).where("type", /(anggota|admin)/);
})
  .prefix("/api")
  .middleware(["auth"]);
