import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// create.jsx lee la cookie al importarse el modulo, asi que debe existir antes del import
vi.hoisted(() => {
  document.cookie = "token=create-token";
});

vi.mock("../../src/services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    defaults: { headers: { common: {} } },
  },
}));

import api from "../../src/services/api";
import UsersCreate from "../../src/views/admin/users/create.jsx";
import { renderView, apiError } from "../helpers/render";

const fillForm = async (user) => {
  await user.type(screen.getByPlaceholderText("Full Name"), "Ana");
  await user.type(screen.getByPlaceholderText("Email Address"), "ana@mail.com");
  await user.type(screen.getByPlaceholderText("Password"), "secret123");
};

const renderCreate = () => renderView(<UsersCreate />, { path: "/admin/users/create" });

describe("vista de usuarios (crear)", () => {
  it("TC-F09: envia los datos a la API con el token y vuelve al listado", async () => {
    api.post.mockResolvedValue({});
    const user = userEvent.setup();
    renderCreate();

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "SAVE" }));

    expect(api.post).toHaveBeenCalledWith("/api/users/create", {
      name: "Ana",
      email: "ana@mail.com",
      password: "secret123",
    });
    expect(api.defaults.headers.common.Authorization).toBe("create-token");
    expect(await screen.findByTestId("location")).toHaveTextContent("/admin/users");
  });

  it("TC-F10: muestra los errores de validacion y no cambia de pantalla", async () => {
    api.post.mockRejectedValue(
      apiError({
        success: false,
        message: "Validation error",
        errors: [
          { path: "email", msg: "Email already exists" },
          { path: "password", msg: "Password must be at least 6 characters long" },
        ],
      })
    );
    const user = userEvent.setup();
    renderCreate();

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "SAVE" }));

    expect(await screen.findByText("email : Email already exists")).toBeInTheDocument();
    expect(
      screen.getByText("password : Password must be at least 6 characters long")
    ).toBeInTheDocument();
    expect(screen.queryByTestId("location")).not.toBeInTheDocument();
  });
});
