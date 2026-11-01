jest.mock("../../prisma/client", () => require("../helpers/prismaMock"));

const request = require("supertest");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../../prisma/client");
const app = require("../../app");
const { PASSWORD, makeUser } = require("../helpers/fixtures");

const newUser = { name: "Ana", email: "ana@mail.com", password: PASSWORD };

beforeEach(() => {
  jest.resetAllMocks();
  prisma.user.findUnique.mockResolvedValue(null);
});

describe("GET /", () => {
  test("TC-I01: la API responde en la raiz", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.text).toBe("Hello World!");
  });
});

describe("POST /api/register", () => {
  test("TC-I02: registra un usuario y guarda la contrasena cifrada", async () => {
    prisma.user.create.mockImplementation(async ({ data }) => makeUser(data));

    const res = await request(app).post("/api/register").send(newUser);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ success: true, message: "Register successfully" });
    expect(res.body.data).toMatchObject({ name: "Ana", email: "ana@mail.com" });

    const stored = prisma.user.create.mock.calls[0][0].data.password;
    expect(stored).not.toBe(PASSWORD);
    expect(await bcrypt.compare(PASSWORD, stored)).toBe(true);
  });

  test("TC-I03: devuelve 422 con los errores cuando faltan datos", async () => {
    const res = await request(app).post("/api/register").send({});

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Validation error");
    expect(res.body.errors.length).toBeGreaterThan(0);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  test("TC-I04: devuelve 422 si el correo ya esta registrado", async () => {
    prisma.user.findUnique.mockResolvedValue(makeUser());

    const res = await request(app).post("/api/register").send(newUser);

    expect(res.status).toBe(422);
    expect(res.body.errors.map((e) => e.msg)).toContain("Email already exists");
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  test("TC-I05: devuelve 500 si la base de datos falla", async () => {
    prisma.user.create.mockRejectedValue(new Error("db down"));

    const res = await request(app).post("/api/register").send(newUser);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ success: false, message: "Internal server error" });
  });
});

describe("POST /api/login", () => {
  const credentials = { email: "ana@mail.com", password: PASSWORD };

  test("TC-I06: inicia sesion y entrega un JWT firmado, sin exponer la contrasena", async () => {
    // La consulta real usa `select`: solo devuelve estos cuatro campos
    const { id, name, email, password } = makeUser({ id: 7 });
    prisma.user.findFirst.mockResolvedValue({ id, name, email, password });

    const res = await request(app).post("/api/login").send(credentials);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Login successfully");
    expect(res.body.data.user).toEqual({ id: 7, name: "Ana", email: "ana@mail.com" });

    const payload = jwt.verify(res.body.data.token, process.env.JWT_SECRET);
    expect(payload.id).toBe(7);
  });

  test("TC-I07: devuelve 404 si el usuario no existe", async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    const res = await request(app).post("/api/login").send(credentials);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ success: false, message: "User not found" });
  });

  test("TC-I08: devuelve 401 si la contrasena es incorrecta", async () => {
    prisma.user.findFirst.mockResolvedValue(makeUser());

    const res = await request(app)
      .post("/api/login")
      .send({ ...credentials, password: "otra-clave" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ success: false, message: "Invalid password" });
  });

  test("TC-I09: devuelve 422 si el cuerpo no cumple la validacion", async () => {
    const res = await request(app).post("/api/login").send({ email: "", password: "1" });

    expect(res.status).toBe(422);
    expect(prisma.user.findFirst).not.toHaveBeenCalled();
  });

  test("TC-I10: devuelve 500 si la base de datos falla", async () => {
    prisma.user.findFirst.mockRejectedValue(new Error("db down"));

    const res = await request(app).post("/api/login").send(credentials);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ success: false, message: "Internal server error" });
  });
});
