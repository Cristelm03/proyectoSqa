jest.mock("../../prisma/client", () => require("../helpers/prismaMock"));

const prisma = require("../../prisma/client");
const userController = require("../../controllers/UserController");
const { mockRes } = require("../helpers/fixtures");

beforeEach(() => {
  jest.resetAllMocks();
});

describe("UserController (aislado, sin servidor)", () => {
  test("TC-U21: findUsers responde 200 con la lista que entrega la base de datos", async () => {
    const users = [{ id: 1, name: "Ana", email: "ana@mail.com" }];
    prisma.user.findMany.mockResolvedValue(users);
    const res = mockRes();

    await userController.findUsers({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Get all users successfully",
      data: users,
    });
  });

  test("TC-U22: un error generico de la base de datos responde 500", async () => {
    prisma.user.findMany.mockRejectedValue(new Error("db down"));
    const res = mockRes();

    await userController.findUsers({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ success: false, message: "Internal server error" });
  });

  test("TC-U23: el error P2025 de Prisma responde 404", async () => {
    prisma.user.delete.mockRejectedValue(Object.assign(new Error("not found"), { code: "P2025" }));
    const res = mockRes();

    await userController.deleteUser({ params: { id: "4" } }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({ success: false, message: "User not found" });
  });

  test("TC-U24: un id invalido responde 400 sin consultar la base de datos", async () => {
    const res = mockRes();

    await userController.findUserById({ params: { id: "abc" } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });
});
