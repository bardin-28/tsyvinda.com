import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ApiError } from "@/api";
import { resetPassword } from "@/api/auth";

import { ResetPasswordForm } from "./ResetPasswordForm";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/api/auth", () => ({
  resetPassword: jest.fn(),
}));

const resetPasswordMock = resetPassword as jest.MockedFunction<
  typeof resetPassword
>;

// A token long enough to pass the 32-128 char shape guard.
const VALID_TOKEN = "a".repeat(40);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ResetPasswordForm", () => {
  it("renders the invalid-link panel when the token is missing", () => {
    render(<ResetPasswordForm token="" />);

    expect(screen.getByText(/invalid reset link/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("New password")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /request a new link/i }),
    ).toBeInTheDocument();
  });

  it("renders the invalid-link panel when the token is too short", () => {
    render(<ResetPasswordForm token="short" />);

    expect(screen.getByText(/invalid reset link/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("New password")).not.toBeInTheDocument();
  });

  it("rejects a weak password and does not call the API", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm token={VALID_TOKEN} />);

    await user.type(screen.getByLabelText("New password"), "abcdefgh");
    await user.type(screen.getByLabelText("Confirm new password"), "abcdefgh");
    await user.click(screen.getByRole("button", { name: /update password/i }));

    expect(
      await screen.findByText(/password must contain a digit/i),
    ).toBeInTheDocument();
    expect(resetPasswordMock).not.toHaveBeenCalled();
  });

  it("rejects mismatched passwords", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm token={VALID_TOKEN} />);

    await user.type(screen.getByLabelText("New password"), "Sup3rSecret");
    await user.type(
      screen.getByLabelText("Confirm new password"),
      "Different1",
    );
    await user.click(screen.getByRole("button", { name: /update password/i }));

    expect(
      await screen.findByText(/passwords do not match/i),
    ).toBeInTheDocument();
    expect(resetPasswordMock).not.toHaveBeenCalled();
  });

  it("submits the token + password and redirects to login on success", async () => {
    resetPasswordMock.mockResolvedValue({ message: "Password updated." });
    const user = userEvent.setup();
    render(<ResetPasswordForm token={VALID_TOKEN} />);

    await user.type(screen.getByLabelText("New password"), "Sup3rSecret");
    await user.type(
      screen.getByLabelText("Confirm new password"),
      "Sup3rSecret",
    );
    await user.click(screen.getByRole("button", { name: /update password/i }));

    await waitFor(() =>
      expect(resetPasswordMock).toHaveBeenCalledWith({
        token: VALID_TOKEN,
        password: "Sup3rSecret",
        confirmPassword: "Sup3rSecret",
      }),
    );
    expect(await screen.findByText(/password updated/i)).toBeInTheDocument();

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/login"), {
      timeout: 3000,
    });
  });

  it("surfaces the backend message when the token is rejected", async () => {
    resetPasswordMock.mockRejectedValue(
      new ApiError("Bad Request", 400, {
        message: "This reset link is invalid or has expired.",
      }),
    );
    const user = userEvent.setup();
    render(<ResetPasswordForm token={VALID_TOKEN} />);

    await user.type(screen.getByLabelText("New password"), "Sup3rSecret");
    await user.type(
      screen.getByLabelText("Confirm new password"),
      "Sup3rSecret",
    );
    await user.click(screen.getByRole("button", { name: /update password/i }));

    expect(
      await screen.findByText(/invalid or has expired/i),
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
