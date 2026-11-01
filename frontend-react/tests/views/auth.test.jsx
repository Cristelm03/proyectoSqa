import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Cookies from "js-cookie";

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
import Login from "../../src/views/auth/login.jsx";
import Register from "../../src/views/auth/register.jsx";
import { renderView, apiError } from "../helpers/render";

let logSpy;

beforeEach(() => {
  // login.jsx hace console.log(error) al fallar
  logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  logSpy.mockRestore();
});

describe("vista de login", () => {
  const fillCredentials = async (user) => {
    await user.type(screen.getByPlaceholderText("Email Address"), "ana@mail.com");
    await user.type(screen.getByPlaceholderText("Password"), "secret123");
  };

  it("TC-F14: inicia sesion, guarda token y usuario en cookies y va al dashboard", async () => {
    api.post.mockResolvedValue({
      data: {
        data: { token: "jwt-abc", user: { id: 1, name: "Ana", email: "ana@mail.com" } },
      },
    });
    const user = userEvent.setup();
    const { authValue } = renderView(<Login />, { path: "/login" });

    await fillCredentials(user);
    await user.click(screen.getByRole("button", { name: "LOGIN" }));

    expect(api.post).toHaveBeenCalledWith("/api/login", {
      email: "ana@mail.com",
      password: "secret123",
    });
    expect(await screen.findByTestId("location")).toHaveTextContent("/admin/dashboard");
    expect(Cookies.get("token")).toBe("jwt-abc");
    expect(JSON.parse(Cookies.get("user"))).toEqual({
      id: 1,
      name: "Ana",
      email: "ana@mail.com",
    });
    expect(authValue.setIsAuthenticated).toHaveBeenCalledWith(true);
  });

  it("TC-F15: con credenciales incorrectas muestra el mensaje y no inicia sesion", async () => {
    api.post.mockRejectedValue(apiError({ success: false, message: "Invalid password" }));
    const user = userEvent.setup();
    const { authValue } = renderView(<Login />, { path: "/login" });

    await fillCredentials(user);
    await user.click(screen.getByRole("button", { name: "LOGIN" }));

    expect(await screen.findByText("Invalid password")).toBeInTheDocument();
    expect(authValue.setIsAuthenticated).not.toHaveBeenCalled();
    expect(Cookies.get("token")).toBeUndefined();
    expect(screen.queryByTestId("location")).not.toBeInTheDocument();
  });

  it("TC-F16: muestra los errores de validacion del servidor", async () => {
    api.post.mockRejectedValue(
      apiError({
        success: false,
        message: "Validation error",
        errors: [{ path: "email", msg: "Email is required" }],
      })
    );
    const user = userEvent.setup();
    renderView(<Login />, { path: "/login" });

    await fillCredentials(user);
    await user.click(screen.getByRole("button", { name: "LOGIN" }));

    expect(await screen.findByText("email : Email is required")).toBeInTheDocument();
  });
});

describe("vista de registro", () => {
  const fillForm = async (user) => {
    await user.type(screen.getByPlaceholderText("Full Name"), "Ana");
    await user.type(screen.getByPlaceholderText("Email Address"), "ana@mail.com");
    await user.type(screen.getByPlaceholderText("Password"), "secret123");
  };

  it("TC-F17: registra al usuario y lleva a la pantalla de login", async () => {
    api.post.mockResolvedValue({});
    const user = userEvent.setup();
    renderView(<Register />, { path: "/register" });

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "REGISTER" }));

    expect(api.post).toHaveBeenCalledWith("/api/register", {
      name: "Ana",
      email: "ana@mail.com",
      password: "secret123",
    });
    expect(await screen.findByTestId("location")).toHaveTextContent("/login");
  });

  it("TC-F18: muestra los errores de validacion y no cambia de pantalla", async () => {
    api.post.mockRejectedValue(
      apiError({
        success: false,
        message: "Validation error",
        errors: [{ path: "email", msg: "Email already exists" }],
      })
    );
    const user = userEvent.setup();
    renderView(<Register />, { path: "/register" });

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "REGISTER" }));

    expect(await screen.findByText("email : Email already exists")).toBeInTheDocument();
    expect(screen.queryByTestId("location")).not.toBeInTheDocument();
  });
});
