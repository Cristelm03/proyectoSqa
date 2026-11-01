import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import App from "../src/App.jsx";
import { AuthProvider } from "../src/context/AuthContext.jsx";
import api from "../src/services/api.js";

describe("App", () => {
  it("TC-F33: muestra la barra superior y la pagina de inicio", () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByRole("link", { name: "HOME" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("button", { name: "Toggle navigation" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /FULLTSACK JAVASCRIPT DEVELOPER/ })).toBeInTheDocument();
  });
});

describe("cliente de la API", () => {
  it("TC-F34: apunta al backend local", () => {
    expect(api.defaults.baseURL).toBe("http://localhost:3000");
  });
});
