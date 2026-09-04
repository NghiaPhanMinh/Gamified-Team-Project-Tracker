import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GoogleSignInButton } from "./GoogleSignInButton";

const { signInMock } = vi.hoisted(() => ({ signInMock: vi.fn() }));

vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({ signIn: signInMock }),
}));

describe("GoogleSignInButton", () => {
  afterEach(() => {
    cleanup();
    signInMock.mockReset();
  });

  it("returns successful Google sign-ins to the authenticated home", async () => {
    signInMock.mockResolvedValue({ signingIn: true });
    render(<GoogleSignInButton />);

    fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith("google", {
        redirectTo: expect.stringMatching(/\/home$/),
      });
    });
  });
});
