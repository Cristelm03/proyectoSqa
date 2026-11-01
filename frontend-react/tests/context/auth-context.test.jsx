import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useContext } from "react";
import Cookies from "js-cookie";

import { AuthContext, AuthProvider } from "../../src/context/AuthContext.jsx";

function Status() {
  const { isAuthenticated } = useContext(AuthContext);
  return <p>{isAuthenticated ? "autenticado" : "anonimo"}</p>;
}

const renderProvider = () =>
  render(
    <AuthProvider>
      <Status />
    </AuthProvider>
  );

describe("AuthProvider", () => {
  it("TC-F24: empieza autenticado si existe la cookie del token", () => {
    Cookies.set("token", "jwt-abc");

    renderProvider();

    expect(screen.getByText("autenticado")).toBeInTheDocument();
  });

  it("TC-F25: empieza como anonimo si no hay cookie", () => {
    renderProvider();

    expect(screen.getByText("anonimo")).toBeInTheDocument();
  });

  it("TC-F26: reacciona al evento storage cuando cambia el token", () => {
    Cookies.set("token", "jwt-abc");
    renderProvider();
    expect(screen.getByText("autenticado")).toBeInTheDocument();

    Cookies.remove("token");
    fireEvent(window, new Event("storage"));

    expect(screen.getByText("anonimo")).toBeInTheDocument();
  });

  it("TC-F27: al desmontarse deja de escuchar el evento storage", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderProvider();

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("storage", expect.any(Function));
    removeSpy.mockRestore();
  });
});
