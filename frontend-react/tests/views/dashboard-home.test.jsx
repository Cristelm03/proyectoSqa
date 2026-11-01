import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import Cookies from "js-cookie";

import Dashboard from "../../src/views/admin/dashboard/index.jsx";
import Home from "../../src/views/home/index.jsx";
import { renderView } from "../helpers/render";

describe("dashboard", () => {
  it("TC-F19: saluda al usuario guardado en la cookie", () => {
    Cookies.set("user", JSON.stringify({ id: 1, name: "Ana", email: "ana@mail.com" }));

    renderView(<Dashboard />, { path: "/admin/dashboard" });

    expect(screen.getByText("DASHBOARD")).toBeInTheDocument();
    expect(screen.getByText("Ana")).toBeInTheDocument();
  });

  it("TC-F20: sin cookie de usuario no muestra ningun nombre", () => {
    const { container } = renderView(<Dashboard />, { path: "/admin/dashboard" });

    expect(screen.getByText(/Selamat Datang/)).toBeInTheDocument();
    expect(container.querySelector("strong")).toBeEmptyDOMElement();
  });
});

describe("pagina de inicio", () => {
  it("TC-F21: muestra el titulo y los enlaces a registro y login", () => {
    renderView(<Home />, { path: "/" });

    expect(screen.getByRole("heading", { name: /FULLTSACK JAVASCRIPT DEVELOPER/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "REGISTER" })).toHaveAttribute("href", "/register");
    expect(screen.getByRole("link", { name: "LOGIN" })).toHaveAttribute("href", "/login");
  });
});
