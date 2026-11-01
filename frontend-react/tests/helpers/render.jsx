import { vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthContext } from "../../src/context/AuthContext";

// Muestra la ruta actual: sirve para comprobar a donde navega una vista
function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

// Renderiza una vista dentro de un router en memoria y un AuthContext controlado.
// Cualquier otra ruta a la que navegue la vista cae en LocationProbe.
export function renderView(element, { path = "/", routePath = path, auth = {} } = {}) {
  const authValue = { isAuthenticated: true, setIsAuthenticated: vi.fn(), ...auth };

  const utils = render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={routePath} element={element} />
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );

  return { ...utils, authValue };
}

// Error con la forma que produce axios cuando el servidor responde con un codigo de error
export const apiError = (data) => Object.assign(new Error("Request failed"), { response: { data } });
