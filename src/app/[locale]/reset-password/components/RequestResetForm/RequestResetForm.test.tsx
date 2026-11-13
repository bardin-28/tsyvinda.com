import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ApiError } from "@/api";
import { renderWithIntl } from "@/shared/testing/intl";
import { requestPasswordReset } from "@/api/auth";

import { RequestResetForm } from "./RequestResetForm";

jest.mock("@/api/auth", () => ({
  requestPasswordReset: jest.fn(),
}));

// Stub Turnstile so the form submits with an empty token and never loads the
// real Cloudflare script.
jest.mock("@/shared/turnstile", () => ({
  useTurnstile: () => ({
    containerRef: { current: null },
    execute: () => Promise.resolve(""),
    reset: () => {},
    isEnabled: false,
  }),
}));

const requestPasswordResetMock = requestPasswordReset as jest.MockedFunction<
  typeof requestPasswordReset
>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("RequestResetForm", () => {
  it("shows a validation error and does not call the API for an invalid email", async () => {
    const user = userEvent.setup();
    renderWithIntl(<RequestResetForm />);

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
    expect(requestPasswordResetMock).not.toHaveBeenCalled();
  });

  it("submits the email and shows the generic success panel", async () => {
    requestPasswordResetMock.mockResolvedValue({ message: "ok" });
    const user = userEvent.setup();
    renderWithIntl(<RequestResetForm />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() =>
      expect(requestPasswordResetMock).toHaveBeenCalledWith(
        "user@example.com",
        "",
      ),
    );
    expect(await screen.findByText(/check your inbox/i)).toBeInTheDocument();
    expect(
      screen.getByText(/if an account exists for that email/i),
    ).toBeInTheDocument();
  });

  it("surfaces the backend message when the request fails", async () => {
    requestPasswordResetMock.mockRejectedValue(
      new ApiError("Too Many Requests", 429, { message: "Slow down" }),
    );
    const user = userEvent.setup();
    renderWithIntl(<RequestResetForm />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(await screen.findByText(/slow down/i)).toBeInTheDocument();
    expect(screen.queryByText(/check your inbox/i)).not.toBeInTheDocument();
  });

  it("shows the Ukrainian validation error for an invalid email", async () => {
    const user = userEvent.setup();
    renderWithIntl(<RequestResetForm />, { locale: "uk" });

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.click(
      screen.getByRole("button", { name: "Надіслати посилання" }),
    );

    expect(await screen.findByText("Некоректний email")).toBeInTheDocument();
    expect(requestPasswordResetMock).not.toHaveBeenCalled();
  });
});
