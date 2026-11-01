jest.mock("../../prisma/client", () => require("../helpers/prismaMock"));

const request = require("supertest");
const prisma = require("../../prisma/client");
const app = require("../../app");
const { PASSWORD, makeUser, makeToken } = require("../helpers/fixtures");

const token = makeToken();
const userData = { name: "Ana", email: "ana@mail.com", password: PASSWORD };

beforeEach(() => {
  jest.resetAllMocks();
  prisma.user.findUnique.mockResolvedValue(null);
});

describe("autenticacion de las rutas /api/users", () => {
  test.each([
    ["get", "/api/users"],
    ["post", "/api/users/create"],
    ["get", "/api/users/find/1"],
    ["put", "/api/users/update/1"],
    ["delete", "/api/users/delete/1"],
  ])("TC-I11: %s %s exige un token", async (method, path) => {
    const res = await request(app)[method](path);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: "Unauthenticated." });
  });

  test("TC-I12: rechaza un token invalido", async () => {
    const res = await request(app).get("/api/users").set("Authorization", "token-falso");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: "Invalid token" });
  });
});

describe("GET /api/users", () => {
  test("TC-I13: lista los usuarios sin pedir la contrasena a la base de datos", async () => {
    prisma.user.findMany.mockResolvedValue([
      { id: 2, name: "Beto", email: "beto@mail.com" },
      { id: 1, name: "Ana", email: "ana@mail.com" },
    ]);

    const res = await request(app).get("/api/users").set("Authorization", token);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Get all users successfully");
    expect(res.body.data).toHaveLength(2);
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ select: { id: true, name: true, email: true } })
    );
  });

  test("TC-I14: devuelve 500 si la base de datos falla", async () => {
    prisma.user.findMany.mockRejectedValue(new Error("db down"));

    const res = await request(app).get("/api/users").set("Authorization", token);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ success: false, message: "Internal server error" });
  });
});

describe("POST /api/users/create", () => {
  test("TC-I15: crea un usuario con la contrasena cifrada", async () => {
    prisma.user.create.mockImplementation(async ({ data }) => makeUser({ id: 3, ...data }));

    const res = await request(app)
      .post("/api/users/create")
      .set("Authorization", token)
      .send(userData);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ success: true, message: "User created successfully" });
    expect(res.body.data).toMatchObject({ id: 3, name: "Ana", email: "ana@mail.com" });
    expect(prisma.user.create.mock.calls[0][0].data.password).not.toBe(PASSWORD);
  });

  test("TC-I16: devuelve 422 si los datos no son validos", async () => {
    const res = await request(app)
      .post("/api/users/create")
      .set("Authorization", token)
      .send({ name: "", email: "x", password: "1" });

    expect(res.status).toBe(422);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  test("TC-I17: devuelve 500 si la base de datos falla", async () => {
    prisma.user.create.mockRejectedValue(new Error("db down"));

    const res = await request(app)
      .post("/api/users/create")
      .set("Authorization", token)
      .send(userData);

    expect(res.status).toBe(500);
  });
});

describe("GET /api/users/find/:id", () => {
  test("TC-I18: devuelve el usuario solicitado", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1, name: "Ana", email: "ana@mail.com" });

    const res = await request(app).get("/api/users/find/1").set("Authorization", token);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Get user By ID :1");
    expect(res.body.data).toEqual({ id: 1, name: "Ana", email: "ana@mail.com" });
    expect(prisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 } })
    );
  });

  test("TC-I19: devuelve 500 si la base de datos falla", async () => {
    prisma.user.findUnique.mockRejectedValue(new Error("db down"));

    const res = await request(app).get("/api/users/find/1").set("Authorization", token);

    expect(res.status).toBe(500);
  });
});

describe("PUT /api/users/update/:id", () => {
  test("TC-I20: actualiza el usuario indicado", async () => {
    prisma.user.update.mockImplementation(async ({ where, data }) =>
      makeUser({ id: where.id, ...data })
    );

    const res = await request(app)
      .put("/api/users/update/5")
      .set("Authorization", token)
      .send(userData);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, message: "User updated successfully" });
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 5 } }));
  });

  test("TC-I21: devuelve 422 si los datos no son validos", async () => {
    const res = await request(app)
      .put("/api/users/update/5")
      .set("Authorization", token)
      .send({ name: "", email: "ana@mail.com", password: "1" });

    expect(res.status).toBe(422);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  test("TC-I22: devuelve 500 si la base de datos falla", async () => {
    prisma.user.update.mockRejectedValue(new Error("db down"));

    const res = await request(app)
      .put("/api/users/update/5")
      .set("Authorization", token)
      .send(userData);

    expect(res.status).toBe(500);
  });
});

describe("DELETE /api/users/delete/:id", () => {
  test("TC-I23: elimina el usuario indicado", async () => {
    prisma.user.delete.mockResolvedValue(makeUser({ id: 3 }));

    const res = await request(app).delete("/api/users/delete/3").set("Authorization", token);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, message: "User deleted successfully" });
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 3 } });
  });

  test("TC-I24: devuelve 500 si la base de datos falla", async () => {
    prisma.user.delete.mockRejectedValue(new Error("db down"));

    const res = await request(app).delete("/api/users/delete/3").set("Authorization", token);

    expect(res.status).toBe(500);
  });
});
