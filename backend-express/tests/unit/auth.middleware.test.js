const verifyToken = require("../../middleware/auth");
const { makeToken, mockRes } = require("../helpers/fixtures");

const run = (authorization) => {
  const req = { headers: authorization === undefined ? {} : { authorization } };
  const res = mockRes();
  const next = jest.fn();
  verifyToken(req, res, next);
  return { req, res, next };
};

describe("middleware verifyToken", () => {
  test("TC-U01: rechaza la peticion sin cabecera Authorization", () => {
    const { res, next } = run(undefined);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthenticated." });
    expect(next).not.toHaveBeenCalled();
  });

  test("TC-U02: rechaza un token con firma invalida", () => {
    const { res, next } = run("esto-no-es-un-jwt");

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });

  test("TC-U03: rechaza un token expirado", () => {
    const expired = makeToken(1, { expiresIn: -10 });
    const { res, next } = run(expired);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });

  test("TC-U04: acepta un token valido y guarda el id del usuario en la peticion", () => {
    const { req, res, next } = run(makeToken(42));

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.userId).toBe(42);
    expect(res.status).not.toHaveBeenCalled();
  });
});
