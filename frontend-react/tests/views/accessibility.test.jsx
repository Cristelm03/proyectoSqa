// Protegen la correccion de Sonar S6853 (label sin control asociado) y S6848 (elemento
// interactivo no nativo): cada campo debe poder localizarse por su etiqueta.
import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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
import UsersEdit from "../../src/views/admin/users/edit.jsx";
import Login from "../../src/views/auth/login.jsx";
import Register from "../../src/views/auth/register.jsx";
import SidebarMenu from "../../src/components/SidebarMenu.jsx";
import { renderView } from "../helpers/render";

describe("formularios accesibles", () => {
  it("TC-F36: el formulario de crear usuario asocia cada etiqueta con su campo", async () => {
    const user = userEvent.setup();
    renderView(<UsersCreate />, { path: "/admin/users/create" });

    await user.type(screen.getByLabelText("Full Name"), "Ana");
    await user.type(screen.getByLabelText("Email address"), "ana@mail.com");
    await user.type(screen.getByLabelText("Password"), "secret123");

    expect(screen.getByPlaceholderText("Full Name")).toHaveValue("Ana");
    expect(screen.getByPlaceholderText("Email Address")).toHaveValue("ana@mail.com");
    expect(screen.getByPlaceholderText("Password")).toHaveValue("secret123");
  });

  it("TC-F37: el formulario de editar usuario asocia cada etiqueta con su campo", async () => {
    api.get.mockResolvedValue({ data: { data: { id: 5, name: "Ana", email: "ana@mail.com" } } });
    renderView(<UsersEdit />, {
      path: "/admin/users/edit/5",
      routePath: "/admin/users/edit/:id",
    });

    expect(await screen.findByLabelText("Full Name")).toHaveValue("Ana");
    expect(screen.getByLabelText("Email address")).toHaveValue("ana@mail.com");
    expect(screen.getByLabelText("Password")).toHaveValue("");
  });

  it("TC-F38: el formulario de login asocia cada etiqueta con su campo", () => {
    renderView(<Login />, { path: "/login" });

    expect(screen.getByLabelText("Email address")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });

  it("TC-F39: el formulario de registro asocia cada etiqueta con su campo", () => {
    renderView(<Register />, { path: "/register" });

    expect(screen.getByLabelText("Full Name")).toHaveAttribute("type", "text");
    expect(screen.getByLabelText("Email address")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });
});

describe("menu lateral accesible", () => {
  it("TC-F40: Logout es un boton nativo, alcanzable con el teclado", () => {
    renderView(<SidebarMenu />, { path: "/admin/dashboard" });

    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
  });
});
