const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Contrasena en claro de los usuarios de prueba y su hash (costo 4: rapido en tests)
const PASSWORD = "secret123";
const PASSWORD_HASH = bcrypt.hashSync(PASSWORD, 4);

// Usuario tal como lo devolveria Prisma (incluye el hash de la contrasena)
const makeUser = (overrides = {}) => ({
  id: 1,
  name: "Ana",
  email: "ana@mail.com",
  password: PASSWORD_HASH,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  ...overrides,
});

// Token JWT valido firmado con el secreto de pruebas
const makeToken = (id = 1, options = { expiresIn: "1h" }) =>
  jwt.sign({ id }, process.env.JWT_SECRET, options);

// Doble minimo de la respuesta de Express para probar controladores sin servidor
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

module.exports = { PASSWORD, PASSWORD_HASH, makeUser, makeToken, mockRes };
