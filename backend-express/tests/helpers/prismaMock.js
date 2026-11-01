// Doble de prisma/client: las pruebas no necesitan MySQL.
// Cada test define lo que devuelve la "base de datos" con mockResolvedValue / mockRejectedValue.
module.exports = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};
