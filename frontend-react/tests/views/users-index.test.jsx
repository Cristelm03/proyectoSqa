import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
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
import UsersIndex from "../../src/views/admin/users/index.jsx";
import { renderView } from "../helpers/render";

const users = [
  { id: 1, name: "Ana", email: "ana@mail.com" },
  { id: 2, name: "Beto", email: "beto@mail.com" },
];

let errorSpy;

beforeEach(() => {
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  errorSpy.mockRestore();
});

const renderIndex = () => renderView(<UsersIndex />, { path: "/admin/users" });

describe("vista de usuarios (listado)", () => {
  it("TC-F01: lista los usuarios que devuelve la API y envia el token", async () => {
    Cookies.set("token", "jwt-1");
    api.get.mockResolvedValue({ data: { data: users } });

    renderIndex();

    expect(await screen.findByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("beto@mail.com")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/api/users");
    expect(api.defaults.headers.common.Authorization).toBe("jwt-1");
    expect(screen.getAllByRole("link", { name: "EDIT" })[0]).toHaveAttribute(
      "href",
      "/admin/users/edit/1"
    );
  });

  it("TC-F02: muestra un aviso cuando no hay usuarios", async () => {
    Cookies.set("token", "jwt-1");
    api.get.mockResolvedValue({ data: { data: [] } });

    renderIndex();

    expect(await screen.findByText("Data Belum Tersedia!")).toBeInTheDocument();
  });

  it("TC-F03: sin token no llama a la API", () => {
    renderIndex();

    expect(api.get).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith("Token is not available!");
    expect(screen.getByText("Data Belum Tersedia!")).toBeInTheDocument();
  });

  it("TC-F04: si la API falla registra el error y no rompe la pantalla", async () => {
    Cookies.set("token", "jwt-1");
    api.get.mockRejectedValue(new Error("network"));

    renderIndex();

    await waitFor(() =>
      expect(errorSpy).toHaveBeenCalledWith(
        "There was an error fetching the users!",
        expect.any(Error)
      )
    );
    expect(screen.getByText("Data Belum Tersedia!")).toBeInTheDocument();
  });

  it("TC-F05: el boton ADD USER lleva a la pantalla de creacion", () => {
    renderIndex();

    expect(screen.getByRole("link", { name: "ADD USER" })).toHaveAttribute(
      "href",
      "/admin/users/create"
    );
  });
});

describe("vista de usuarios (eliminar)", () => {
  it("TC-F06: DELETE llama a la API y recarga la lista", async () => {
    Cookies.set("token", "jwt-1");
    api.get
      .mockResolvedValueOnce({ data: { data: users } })
      .mockResolvedValueOnce({ data: { data: [users[1]] } });
    api.delete.mockResolvedValue({});
    const user = userEvent.setup();
    renderIndex();
    await screen.findByText("Ana");

    await user.click(screen.getAllByRole("button", { name: "DELETE" })[0]);

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith("/api/users/delete/1"));
    await waitFor(() => expect(screen.queryByText("Ana")).not.toBeInTheDocument());
    expect(screen.getByText("Beto")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledTimes(2);
  });

  it("TC-F07: si DELETE falla registra el error y no recarga la lista", async () => {
    Cookies.set("token", "jwt-1");
    api.get.mockResolvedValue({ data: { data: users } });
    api.delete.mockRejectedValue(new Error("boom"));
    const user = userEvent.setup();
    renderIndex();
    await screen.findByText("Ana");

    await user.click(screen.getAllByRole("button", { name: "DELETE" })[0]);

    await waitFor(() =>
      expect(errorSpy).toHaveBeenCalledWith(
        "There was an error deleting the user!",
        expect.any(Error)
      )
    );
    expect(api.get).toHaveBeenCalledTimes(1);
  });

  it("TC-F08: si el token desaparece, DELETE no llama a la API", async () => {
    Cookies.set("token", "jwt-1");
    api.get.mockResolvedValue({ data: { data: users } });
    const user = userEvent.setup();
    renderIndex();
    await screen.findByText("Ana");
    Cookies.remove("token");

    await user.click(screen.getAllByRole("button", { name: "DELETE" })[0]);

    expect(api.delete).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith("Token is not available!");
  });
});
