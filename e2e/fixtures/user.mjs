// Authenticated-user fixture returned by mocked `POST /auth/login` and
// `GET /profile`. Shape mirrors the `User` type in
// src/shared/contexts/UserContext.tsx. profileImageUrl is null so no avatar
// image is fetched (keeps the suite offline).

export const USER = {
  id: "user-1",
  email: "user@example.com",
  firstName: "Test",
  lastName: "User",
  profileImageUrl: null,
  emailVerified: true,
  approvedByAdmin: true,
  createdAt: "2026-01-01T00:00:00.000Z",
};
