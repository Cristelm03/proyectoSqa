import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// edit.jsx lee la cookie al importarse el modulo, asi que debe existir antes del import
vi.hoisted(() => {
  document.cookie = "token=edit-token";
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
import UsersEdit from "../../src/views/admin/users/edit.jsx";
import { renderView, apiError } from "../helpers/render";

const renderEdit = () =>
  renderView(<UsersEdit />, { path: "/admin/users/edit/5", routePath: "/admin/users/edit/:id" });

const loadUser = () =>
  api.get.mockResolvedValue({ data: { data: { id: 5, name: "Ana", email: "ana@mail.com" } } });

describe("vista de usuarios (editar)", () => {
  it("TC-F11: carga el usuario indicado en la URL y rellena el formulario", async () => {
    loadUser();

    renderEdit();

    await waitFor(() => expect(screen.getByPlaceholderText("Full Name")).toHaveValue("Ana"));
    expect(screen.getByPlaceholderText("Email Address")).toHaveValue("ana@mail.com");
    expect(screen.getByPlaceholderText("Password")).toHaveValue("");
    expect(api.get).toHaveBeenCalledWith("/api/users/find/5");
  });

  it("TC-F12: actualiza el usuario con el token y vuelve al listado", async () => {
    loadUser();
    api.put.mockResolvedValue({});
    const user = userEvent.setup();
    renderEdit();
    await waitFor(() => expect(screen.getByPlaceholderText("Full Name")).toHaveValue("Ana"));

    await user.clear(screen.getByPlaceholderText("Full Name"));
    await user.type(screen.getByPlaceholderText("Full Name"), "Ana Maria");
    await user.type(screen.getByPlaceholderText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "UPDATE" }));

    expect(api.put).toHaveBeenCalledWith("/api/users/update/5", {
      name: "Ana Maria",
      email: "ana@mail.com",
      password: "secret123",
    });
    expect(api.defaults.headers.common.Authorization).toBe("edit-token");
    expect(await screen.findByTestId("location")).toHaveTextContent("/admin/users");
  });

  it("TC-F35: si la API falla al cargar el usuario registra el error y deja el formulario vacio", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    api.get.mockRejectedValue(new Error("network"));

    renderEdit();

    await waitFor(() =>
      expect(errorSpy).toHaveBeenCalledWith(
        "There was an error fetching the user!",
        expect.any(Error)
      )
    );
    expect(screen.getByPlaceholderText("Full Name")).toHaveValue("");
    errorSpy.mockRestore();
  });

  it("TC-F13: muestra los errores de validacion al actualizar", async () => {
    loadUser();
    api.put.mockRejectedValue(
      apiError({
        success: false,
        message: "Validation error",
        errors: [{ path: "password", msg: "Password must be at least 6 characters long" }],
      })
    );
    const user = userEvent.setup();
    renderEdit();
    await waitFor(() => expect(screen.getByPlaceholderText("Full Name")).toHaveValue("Ana"));

    await user.type(screen.getByPlaceholderText("Password"), "123");
    await user.click(screen.getByRole("button", { name: "UPDATE" }));

    expect(
      await screen.findByText("password : Password must be at least 6 characters long")
    ).toBeInTheDocument();
    expect(screen.queryByTestId("location")).not.toBeInTheDocument();
  });
});
