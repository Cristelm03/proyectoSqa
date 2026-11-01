jest.mock("../../prisma/client", () => require("../helpers/prismaMock"));

const { validationResult } = require("express-validator");
const prisma = require("../../prisma/client");
const { validateRegister, validateLogin } = require("../../utils/validators/auth");
const { validateUser } = require("../../utils/validators/user");
const { makeUser } = require("../helpers/fixtures");

// Ejecuta una cadena de validadores sobre un body y devuelve los mensajes de error
const messagesFor = async (validators, body, params = {}) => {
  const req = { body, params };
  for (const validator of validators) {
    await validator.run(req);
  }
  return validationResult(req)
    .array()
    .map((error) => error.msg);
};

const validBody = { name: "Ana", email: "ana@mail.com", password: "secret123" };

beforeEach(() => {
  jest.resetAllMocks();
  prisma.user.findUnique.mockResolvedValue(null);
});

describe("validateRegister", () => {
  test("TC-U05: acepta un registro valido", async () => {
    expect(await messagesFor(validateRegister, validBody)).toEqual([]);
  });

  test("TC-U06: exige el nombre", async () => {
    const messages = await messagesFor(validateRegister, { ...validBody, name: "" });
    expect(messages).toContain("Name is required");
  });

  test("TC-U07: exige un correo con formato valido", async () => {
    const messages = await messagesFor(validateRegister, { ...validBody, email: "no-es-correo" });
    expect(messages).toContain("Email is invalid");
  });

  test("TC-U08: exige el correo", async () => {
    const messages = await messagesFor(validateRegister, { ...validBody, email: "" });
    expect(messages).toContain("Email is required");
  });

  test("TC-U09: rechaza un correo que ya existe", async () => {
    prisma.user.findUnique.mockResolvedValue(makeUser());
    const messages = await messagesFor(validateRegister, validBody);
    expect(messages).toContain("Email already exists");
  });

  test("TC-U10: exige una contrasena de al menos 6 caracteres", async () => {
    const messages = await messagesFor(validateRegister, { ...validBody, password: "12345" });
    expect(messages).toContain("Password must be at least 6 characters long");
  });
});

describe("validateLogin", () => {
  test("TC-U11: acepta credenciales con formato valido", async () => {
    expect(await messagesFor(validateLogin, { email: "ana@mail.com", password: "secret123" })).toEqual([]);
  });

  test("TC-U12: exige correo y contrasena de 6 caracteres como minimo", async () => {
    const messages = await messagesFor(validateLogin, { email: "", password: "123" });
    expect(messages).toEqual(
      expect.arrayContaining(["Email is required", "Password must be at least 6 characters long"])
    );
  });
});

describe("validateUser", () => {
  test("TC-U13: acepta un usuario valido", async () => {
    expect(await messagesFor(validateUser, validBody)).toEqual([]);
  });

  test("TC-U14: permite conservar el correo del propio usuario al actualizar", async () => {
    prisma.user.findUnique.mockResolvedValue(makeUser({ id: 5 }));
    expect(await messagesFor(validateUser, validBody, { id: "5" })).toEqual([]);
  });

  test("TC-U15: rechaza el correo de otro usuario", async () => {
    prisma.user.findUnique.mockResolvedValue(makeUser({ id: 9 }));
    const messages = await messagesFor(validateUser, validBody, { id: "5" });
    expect(messages).toContain("Email already exists");
  });

  test("TC-U16: exige nombre y contrasena minima", async () => {
    const messages = await messagesFor(validateUser, { name: "", email: "ana@mail.com", password: "1" });
    expect(messages).toEqual(
      expect.arrayContaining(["Name is required", "Password must be at least 6 characters long"])
    );
  });
});
