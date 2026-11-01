jest.mock("../../prisma/client", () => require("../helpers/prismaMock"));

const request = require("supertest");
const app = require("../../app");

describe("cabeceras de seguridad", () => {
  test("TC-I25: no revela el framework en X-Powered-By", async () => {
    const res = await request(app).get("/");

    expect(res.headers).not.toHaveProperty("x-powered-by");
  });
});

describe("CORS", () => {
  test("TC-I26: permite el origen del frontend por defecto", async () => {
    const res = await request(app).get("/").set("Origin", "http://localhost:5173");

    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
  });

  test("TC-I27: no permite un origen desconocido", async () => {
    const res = await request(app).get("/").set("Origin", "https://sitio-malicioso.example");

    expect(res.headers).not.toHaveProperty("access-control-allow-origin");
  });

  test("TC-I28: CORS_ORIGIN define la lista de origenes permitidos", async () => {
    process.env.CORS_ORIGIN = "https://app.example,https://admin.example";
    let configuredApp;
    jest.isolateModules(() => {
      configuredApp = require("../../app");
    });
    delete process.env.CORS_ORIGIN;

    const allowed = await request(configuredApp).get("/").set("Origin", "https://admin.example");
    const denied = await request(configuredApp).get("/").set("Origin", "http://localhost:5173");

    expect(allowed.headers["access-control-allow-origin"]).toBe("https://admin.example");
    expect(denied.headers).not.toHaveProperty("access-control-allow-origin");
  });
});
