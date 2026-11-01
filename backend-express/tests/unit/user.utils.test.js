const { omitPassword, parseId } = require("../../utils/user");
const { makeUser } = require("../helpers/fixtures");

describe("omitPassword", () => {
  test("TC-U17: elimina la contrasena y conserva el resto de campos", () => {
    const user = makeUser({ id: 3 });

    const safe = omitPassword(user);

    expect(safe).not.toHaveProperty("password");
    expect(safe).toMatchObject({ id: 3, name: "Ana", email: "ana@mail.com" });
  });

  test("TC-U18: no modifica el objeto original", () => {
    const user = makeUser();

    omitPassword(user);

    expect(user).toHaveProperty("password");
  });
});

describe("parseId", () => {
  test.each([
    ["5", 5],
    ["120", 120],
    [7, 7],
  ])("TC-U19: %p es un id valido (%p)", (value, expected) => {
    expect(parseId(value)).toBe(expected);
  });

  test.each([["abc"], ["0"], ["-3"], ["1.5"], [""], [undefined], [null]])(
    "TC-U20: %p no es un id valido",
    (value) => {
      expect(parseId(value)).toBeNull();
    }
  );
});
