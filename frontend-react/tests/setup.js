import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import Cookies from "js-cookie";

beforeEach(() => {
  // Cada prueba define lo que devuelve la API simulada
  vi.resetAllMocks();
});

afterEach(() => {
  cleanup();
  Cookies.remove("token");
  Cookies.remove("user");
});
