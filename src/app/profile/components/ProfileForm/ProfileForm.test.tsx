import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useUser } from "@/shared/contexts/UserContext";
import type { User } from "@/shared/contexts/UserContext";
import { updateProfile } from "@/api/profile";

import { ProfileForm } from "./ProfileForm";

jest.mock("@/shared/contexts/UserContext", () => ({
  useUser: jest.fn(),
}));

jest.mock("@/api/profile", () => ({
  updateProfile: jest.fn(),
}));

const useUserMock = useUser as jest.MockedFunction<typeof useUser>;
const updateProfileMock = updateProfile as jest.MockedFunction<typeof updateProfile>;

const setUserMock = jest.fn();
const refetchMock = jest.fn();

const baseUser: User = {
  id: "980de598-64f9-4c36-b346-3f90910544b3",
  email: "vladyslav@tsyvinda.com",
  firstName: "Vladyslav",
  lastName: "Tsyvinda",
  profileImageUrl: null,
  emailVerified: true,
  approvedByAdmin: true,
  createdAt: "2026-05-20T21:32:36.216Z",
};

type UserState = {
  user?: User | null;
  loading?: boolean;
  error?: null;
};

function mockUserState({ user = baseUser, loading = false, error = null }: UserState = {}) {
  useUserMock.mockReturnValue({
    user,
    loading,
    error,
    refetch: refetchMock,
    setUser: setUserMock,
    logout: jest.fn(),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUserState();
  // jsdom lacks object URL APIs used for the avatar preview.
  global.URL.createObjectURL = jest.fn(() => "blob:preview");
  global.URL.revokeObjectURL = jest.fn();
});

describe("ProfileForm", () => {
  it("renders profile fields read-only by default", () => {
    render(<ProfileForm />);

    expect(screen.getByText("Vladyslav")).toBeInTheDocument();
    expect(screen.getByText("Tsyvinda")).toBeInTheDocument();
    expect(screen.getByText("vladyslav@tsyvinda.com")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
    expect(screen.getByText(baseUser.id)).toBeInTheDocument();

    // No editable inputs before clicking Edit.
    expect(screen.queryByLabelText("First name")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit profile/i })).toBeInTheDocument();
  });

  it("reveals editable inputs when Edit is clicked", async () => {
    const user = userEvent.setup();
    render(<ProfileForm />);

    await user.click(screen.getByRole("button", { name: /edit profile/i }));

    expect(screen.getByLabelText("First name")).toHaveValue("Vladyslav");
    expect(screen.getByLabelText("Last name")).toHaveValue("Tsyvinda");
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^cancel$/i })).toBeInTheDocument();
  });

  it("shows a validation error and does not submit when a name is empty", async () => {
    const user = userEvent.setup();
    render(<ProfileForm />);

    await user.click(screen.getByRole("button", { name: /edit profile/i }));
    await user.clear(screen.getByLabelText("First name"));
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();
    expect(updateProfileMock).not.toHaveBeenCalled();
  });

  it("submits changed names as multipart and updates the user", async () => {
    updateProfileMock.mockResolvedValue({ ...baseUser, firstName: "Vlad" });
    const user = userEvent.setup();
    render(<ProfileForm />);

    await user.click(screen.getByRole("button", { name: /edit profile/i }));
    await user.clear(screen.getByLabelText("First name"));
    await user.type(screen.getByLabelText("First name"), "Vlad");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(updateProfileMock).toHaveBeenCalledTimes(1));

    const form = updateProfileMock.mock.calls[0][0];
    expect(form).toBeInstanceOf(FormData);
    expect(form.get("firstName")).toBe("Vlad");
    expect(form.get("lastName")).toBe("Tsyvinda");
    expect(form.get("image")).toBeNull();
    expect(form.get("removeImage")).toBeNull();

    expect(setUserMock).toHaveBeenCalledWith({ ...baseUser, firstName: "Vlad" });
    expect(await screen.findByText(/profile updated/i)).toBeInTheDocument();
  });

  it("appends the selected image file on save", async () => {
    updateProfileMock.mockResolvedValue(baseUser);
    const user = userEvent.setup();
    const { container } = render(<ProfileForm />);

    await user.click(screen.getByRole("button", { name: /edit profile/i }));

    const file = new File(["x"], "avatar.png", { type: "image/png" });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, file);

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(updateProfileMock).toHaveBeenCalledTimes(1));
    const form = updateProfileMock.mock.calls[0][0];
    expect(form.get("image")).toBe(file);
    expect(form.get("removeImage")).toBeNull();
  });

  it("reverts to read-only on Cancel without saving", async () => {
    const user = userEvent.setup();
    render(<ProfileForm />);

    await user.click(screen.getByRole("button", { name: /edit profile/i }));
    await user.clear(screen.getByLabelText("First name"));
    await user.type(screen.getByLabelText("First name"), "Changed");
    await user.click(screen.getByRole("button", { name: /^cancel$/i }));

    expect(updateProfileMock).not.toHaveBeenCalled();
    expect(screen.queryByLabelText("First name")).not.toBeInTheDocument();
    expect(screen.getByText("Vladyslav")).toBeInTheDocument();
  });

  it("shows a loading state while the profile is fetching", () => {
    mockUserState({ user: null, loading: true });
    render(<ProfileForm />);

    expect(screen.getByText(/loading your profile/i)).toBeInTheDocument();
  });

  it("shows an error state with retry when there is no user", async () => {
    mockUserState({ user: null, loading: false });
    const user = userEvent.setup();
    render(<ProfileForm />);

    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });
});
