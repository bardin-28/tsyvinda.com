import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ApiError } from "@/api";
import { register } from "@/api/auth";

import { RegisterForm } from "./RegisterForm";

jest.mock("@/api/auth", () => ({
  register: jest.fn(),
}));

const registerMock = register as jest.MockedFunction<typeof register>;

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("First name"), "Ada");
  await user.type(screen.getByLabelText("Last name"), "Lovelace");
  await user.type(screen.getByLabelText("Email"), "ada@example.com");
  await user.type(screen.getByLabelText("Password"), "Sup3rSecret");
  await user.type(screen.getByLabelText("Confirm password"), "Sup3rSecret");
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("RegisterForm", () => {
  it("rejects a weak password and does not call the API", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText("First name"), "Ada");
    await user.type(screen.getByLabelText("Last name"), "Lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "abcdefgh");
    await user.type(screen.getByLabelText("Confirm password"), "abcdefgh");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      await screen.findByText(/password must contain a digit/i),
    ).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it("rejects mismatched passwords", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText("First name"), "Ada");
    await user.type(screen.getByLabelText("Last name"), "Lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "Sup3rSecret");
    await user.type(screen.getByLabelText("Confirm password"), "Different1");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      await screen.findByText(/passwords do not match/i),
    ).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it("submits the trimmed payload and shows the confirmation panel", async () => {
    registerMock.mockResolvedValue({
      message: "Verification email sent. Please check your inbox.",
    });
    const user = userEvent.setup();
    render(<RegisterForm />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() =>
      expect(registerMock).toHaveBeenCalledWith({
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        password: "Sup3rSecret",
        confirmPassword: "Sup3rSecret",
      }),
    );
    expect(await screen.findByText(/check your inbox/i)).toBeInTheDocument();
  });

  it("surfaces the backend message when the email is already registered", async () => {
    registerMock.mockRejectedValue(
      new ApiError("Conflict", 409, {
        message: "Email already registered",
      }),
    );
    const user = userEvent.setup();
    render(<RegisterForm />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      await screen.findByText(/email already registered/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/check your inbox/i)).not.toBeInTheDocument();
  });
});
