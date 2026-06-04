import { render, screen } from "@testing-library/react";

import { useUser } from "@/shared/contexts/UserContext";

import { ApprovalBanner } from "./ApprovalBanner";

jest.mock("@/shared/contexts/UserContext", () => ({
  useUser: jest.fn(),
}));

const useUserMock = useUser as jest.MockedFunction<typeof useUser>;

function mockUser(user: { approvedByAdmin: boolean } | null) {
  useUserMock.mockReturnValue({
    user: user as never,
    loading: false,
    error: null,
    refetch: jest.fn(),
    setUser: jest.fn(),
    logout: jest.fn(),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ApprovalBanner", () => {
  it("renders nothing when logged out", () => {
    mockUser(null);
    const { container } = render(<ApprovalBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the user is approved", () => {
    mockUser({ approvedByAdmin: true });
    const { container } = render(<ApprovalBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the pending-approval banner when the user is not approved", () => {
    mockUser({ approvedByAdmin: false });
    render(<ApprovalBanner />);

    const banner = screen.getByRole("status");
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveTextContent(/awaiting admin approval/i);
  });
});
