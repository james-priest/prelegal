import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AuthForm from "./AuthForm";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

function submit(email = "ann@example.com", password = "correct horse") {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: password } });
  fireEvent.submit(screen.getByLabelText("Email").closest("form")!);
}

function mockFetch(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("AuthForm", () => {
  beforeEach(() => push.mockClear());
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("signs in and opens the documents page", async () => {
    const fetchMock = mockFetch(200, { id: 1, email: "ann@example.com" });
    render(<AuthForm mode="signin" />);
    submit();
    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/documents/"));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/auth/signin");
    expect(JSON.parse(init.body)).toEqual({ email: "ann@example.com", password: "correct horse" });
  });

  it("creates an account in signup mode", async () => {
    const fetchMock = mockFetch(201, { id: 1, email: "ann@example.com" });
    render(<AuthForm mode="signup" />);
    expect(screen.getByRole("heading", { name: "Create your account" })).toBeTruthy();
    submit();
    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/documents/"));
    expect(fetchMock.mock.calls[0][0]).toBe("/api/auth/signup");
  });

  it("shows the server's error message and stays on the page", async () => {
    mockFetch(401, { detail: "Invalid email or password" });
    render(<AuthForm mode="signin" />);
    submit();
    expect((await screen.findByRole("alert")).textContent).toBe("Invalid email or password");
    expect(push).not.toHaveBeenCalled();
  });

  it("links to the other mode", () => {
    render(<AuthForm mode="signin" />);
    // Next adds the trailing slash (trailingSlash: true) only in a real build.
    expect(screen.getByRole("link", { name: "Create an account" }).getAttribute("href")).toMatch(/^\/signup\/?$/);
  });
});
