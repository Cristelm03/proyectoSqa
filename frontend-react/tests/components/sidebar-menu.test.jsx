import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Cookies from "js-cookie";

import SidebarMenu from "../../src/components/SidebarMenu.jsx";
import { renderView } from "../helpers/render";

describe("menu lateral", () => {
  it("TC-F22: enlaza al dashboard y al listado de usuarios", () => {
    renderView(<SidebarMenu />, { path: "/admin/dashboard" });

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/admin/dashboard"
    );
    expect(screen.getByRole("link", { name: "Users" })).toHaveAttribute("href", "/admin/users");
  });

  it("TC-F23: Logout borra las cookies, desautentica y lleva al login", async () => {
    Cookies.set("token", "jwt-abc");
    Cookies.set("user", JSON.stringify({ name: "Ana" }));
    const user = userEvent.setup();
    const { authValue } = renderView(<SidebarMenu />, { path: "/admin/dashboard" });

    await user.click(screen.getByText("Logout"));

    expect(Cookies.get("token")).toBeUndefined();
    expect(Cookies.get("user")).toBeUndefined();
    expect(authValue.setIsAuthenticated).toHaveBeenCalledWith(false);
    expect(await screen.findByTestId("location")).toHaveTextContent("/login");
  });
});
