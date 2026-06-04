import { render, screen, waitFor } from "@testing-library/react";

import { ApiError } from "@/api";
import { confirmEmail } from "@/api/auth";

import { ConfirmEmail } from "./ConfirmEmail";

jest.mock("@/api/auth", () => ({
  confirmEmail: jest.fn(),
}));

const confirmEmailMock = confirmEmail as jest.MockedFunction<
  typeof confirmEmail
>;

// A token long enough to pass the 32-128 char shape guard.
const VALID_TOKEN = "a".repeat(40);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ConfirmEmail", () => {
  it("shows the malformed-link panel and skips the API when the token is too short", () => {
    render(<ConfirmEmail token="short" />);

    expect(screen.getByText(/confirmation failed/i)).toBeInTheDocument();
    expect(screen.getByText(/missing or malformed/i)).toBeInTheDocument();
    expect(confirmEmailMock).not.toHaveBeenCalled();
  });

  it("confirms the token and shows the success panel", async () => {
    confirmEmailMock.mockResolvedValue({ message: "Email confirmed." });
    render(<ConfirmEmail token={VALID_TOKEN} />);

    expect(screen.getByText(/confirming your email/i)).toBeInTheDocument();

    expect(await screen.findByText(/email confirmed/i)).toBeInTheDocument();
    expect(confirmEmailMock).toHaveBeenCalledTimes(1);
    expect(confirmEmailMock).toHaveBeenCalledWith(VALID_TOKEN);
    expect(
      screen.getByRole("link", { name: /go to sign in/i }),
    ).toBeInTheDocument();
  });

  it("surfaces the backend message when the token is rejected", async () => {
    confirmEmailMock.mockRejectedValue(
      new ApiError("Bad Request", 400, {
        message: "Confirmation token expired",
      }),
    );
    render(<ConfirmEmail token={VALID_TOKEN} />);

    expect(
      await screen.findByText(/confirmation token expired/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/confirmation failed/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /create a new account/i }),
    ).toBeInTheDocument();
  });

  it("calls the confirm endpoint only once", async () => {
    confirmEmailMock.mockResolvedValue({ message: "Email confirmed." });
    render(<ConfirmEmail token={VALID_TOKEN} />);

    await screen.findByText(/email confirmed/i);
    await waitFor(() =>
      expect(confirmEmailMock).toHaveBeenCalledTimes(1),
    );
  });
});
