import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ApiError } from "@/api";
import { requestPasswordReset } from "@/api/auth";

import { RequestResetForm } from "./RequestResetForm";

jest.mock("@/api/auth", () => ({
  requestPasswordReset: jest.fn(),
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
    render(<RequestResetForm />);

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
    expect(requestPasswordResetMock).not.toHaveBeenCalled();
  });

  it("submits the email and shows the generic success panel", async () => {
    requestPasswordResetMock.mockResolvedValue({ message: "ok" });
    const user = userEvent.setup();
    render(<RequestResetForm />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() =>
      expect(requestPasswordResetMock).toHaveBeenCalledWith("user@example.com"),
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
    render(<RequestResetForm />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(await screen.findByText(/slow down/i)).toBeInTheDocument();
    expect(screen.queryByText(/check your inbox/i)).not.toBeInTheDocument();
  });
});
