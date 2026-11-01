import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
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
import { AuthContext } from "../../src/context/AuthContext.jsx";
import AppRoutes from "../../src/routes/index.jsx";

const renderRoutes = (path, isAuthenticated) =>
  render(
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated: vi.fn() }}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </AuthContext.Provider>
  );

describe("rutas de la aplicacion", () => {
  it("TC-F28: la raiz es publica y muestra la pagina de inicio", () => {
    renderRoutes("/", false);

    expect(
      screen.getByRole("heading", { name: /FULLTSACK JAVASCRIPT DEVELOPER/ })
    ).toBeInTheDocument();
  });

  it.each([
    ["/login", "LOGIN"],
    ["/register", "REGISTER"],
  ])("TC-F29: sin sesion %s muestra su formulario", (path, heading) => {
    renderRoutes(path, false);

    expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
  });

  it.each([
    ["/admin/dashboard"],
    ["/admin/users"],
    ["/admin/users/create"],
    ["/admin/users/edit/1"],
  ])("TC-F30: sin sesion %s redirige al login", (path) => {
    renderRoutes(path, false);

    expect(screen.getByRole("heading", { name: "LOGIN" })).toBeInTheDocument();
  });

  it.each([["/login"], ["/register"]])("TC-F31: con sesion %s redirige al dashboard", (path) => {
    renderRoutes(path, true);

    expect(screen.getByText("DASHBOARD")).toBeInTheDocument();
  });

  it.each([
    ["/admin/dashboard", "DASHBOARD"],
    ["/admin/users", "USERS"],
    ["/admin/users/create", "ADD USER"],
    ["/admin/users/edit/1", "EDIT USER"],
  ])("TC-F32: con sesion %s muestra su pantalla", (path, title) => {
    Cookies.set("token", "jwt-abc");
    api.get.mockResolvedValue({ data: { data: [] } });

    renderRoutes(path, true);

    expect(screen.getByText(title)).toBeInTheDocument();
  });
});
