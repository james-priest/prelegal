import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LoginForm from "./LoginForm";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

describe("LoginForm", () => {
  beforeEach(() => push.mockClear());
  afterEach(cleanup);

  it("enters the app on submit without checking credentials", () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "anything" } });
    fireEvent.submit(screen.getByRole("button", { name: "Sign in" }));
    expect(push).toHaveBeenCalledWith("/draft/");
  });

  it("requires email and password", () => {
    render(<LoginForm />);
    expect((screen.getByLabelText("Email") as HTMLInputElement).required).toBe(true);
    expect((screen.getByLabelText("Password") as HTMLInputElement).required).toBe(true);
  });
});
