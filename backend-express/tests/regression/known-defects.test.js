// Pruebas de regresion: cada caso fija el comportamiento correcto de un defecto
// documentado en docs/Linea-Base-Calidad.md (seccion 4). Si el defecto reaparece, el pipeline falla.
jest.mock("../../prisma/client", () => require("../helpers/prismaMock"));

const request = require("supertest");
const prisma = require("../../prisma/client");
const app = require("../../app");
const { PASSWORD, PASSWORD_HASH, makeUser, makeToken } = require("../helpers/fixtures");

const token = makeToken();
const userData = { name: "Ana", email: "ana@mail.com", password: PASSWORD };

// Error que lanza Prisma cuando el registro que se actualiza o elimina no existe
const recordNotFound = () => Object.assign(new Error("Record not found"), { code: "P2025" });

const expectNoPasswordLeak = (res) => {
  expect(res.body.data).not.toHaveProperty("password");
  expect(JSON.stringify(res.body)).not.toContain(PASSWORD_HASH);
};

beforeEach(() => {
  jest.resetAllMocks();
  prisma.user.findUnique.mockResolvedValue(null);
});

describe("defecto 1: la API no debe devolver el hash de la contrasena", () => {
  test("TC-R01: POST /api/register", async () => {
    prisma.user.create.mockResolvedValue(makeUser());

    const res = await request(app).post("/api/register").send(userData);

    expect(res.status).toBe(201);
    expectNoPasswordLeak(res);
  });

  test("TC-R02: POST /api/users/create", async () => {
    prisma.user.create.mockResolvedValue(makeUser());

    const res = await request(app).post("/api/users/create").set("Authorization", token).send(userData);

    expect(res.status).toBe(201);
    expectNoPasswordLeak(res);
  });

  test("TC-R03: PUT /api/users/update/:id", async () => {
    prisma.user.update.mockResolvedValue(makeUser());

    const res = await request(app).put("/api/users/update/1").set("Authorization", token).send(userData);

    expect(res.status).toBe(200);
    expectNoPasswordLeak(res);
  });
});

describe("defecto 2: un usuario inexistente responde 404", () => {
  test("TC-R04: GET /api/users/find/:id", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app).get("/api/users/find/999").set("Authorization", token);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ success: false, message: "User not found" });
  });

  test("TC-R05: PUT /api/users/update/:id", async () => {
    prisma.user.update.mockRejectedValue(recordNotFound());

    const res = await request(app).put("/api/users/update/999").set("Authorization", token).send(userData);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ success: false, message: "User not found" });
  });

  test("TC-R06: DELETE /api/users/delete/:id", async () => {
    prisma.user.delete.mockRejectedValue(recordNotFound());

    const res = await request(app).delete("/api/users/delete/999").set("Authorization", token);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ success: false, message: "User not found" });
  });
});

describe("defecto 3: el middleware acepta el esquema Bearer", () => {
  beforeEach(() => {
    prisma.user.findMany.mockResolvedValue([]);
  });

  test("TC-R07: acepta 'Authorization: Bearer <token>'", async () => {
    const res = await request(app).get("/api/users").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  test("TC-R08: sigue aceptando el token sin prefijo (asi lo envia el frontend)", async () => {
    const res = await request(app).get("/api/users").set("Authorization", token);

    expect(res.status).toBe(200);
  });
});

describe("defecto 4: un id que no es numerico responde 400, no 500", () => {
  // El tercer valor es la operacion de Prisma que el controlador NO debe ejecutar
  test.each([
    ["get", "/api/users/find/abc", "findUnique"],
    ["put", "/api/users/update/abc", "update"],
    ["delete", "/api/users/delete/abc", "delete"],
  ])("TC-R09: %s %s", async (method, path, operation) => {
    const res = await request(app)[method](path).set("Authorization", token).send(userData);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ success: false, message: "Invalid user id" });
    expect(prisma.user[operation]).not.toHaveBeenCalled();
  });
});
