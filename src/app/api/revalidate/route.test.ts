/** @jest-environment node */
import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";

import { POST } from "./route";

jest.mock("next/cache", () => ({ revalidateTag: jest.fn() }));

const SECRET = "s".repeat(32);

function request(body: unknown, authorization?: string) {
  return new NextRequest("https://tsyvinda.com/api/revalidate", {
    method: "POST",
    headers: authorization ? { authorization } : {},
    body: JSON.stringify(body),
  });
}

describe("POST /api/revalidate", () => {
  const original = process.env.REVALIDATE_SECRET;
  beforeEach(() => {
    process.env.REVALIDATE_SECRET = SECRET;
    jest.clearAllMocks();
  });
  afterAll(() => {
    process.env.REVALIDATE_SECRET = original;
  });

  it("expires each unique tag", async () => {
    const response = await POST(
      request({ tags: ["routes", "page:about", "routes"] }, `Bearer ${SECRET}`),
    );
    expect(response.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledTimes(2);
    expect(revalidateTag).toHaveBeenCalledWith("page:about", { expire: 0 });
  });

  it("refuses a wrong secret and bad bodies", async () => {
    expect(
      (await POST(request({ tags: ["routes"] }, "Bearer nope"))).status,
    ).toBe(401);
    expect((await POST(request({ tags: [] }, `Bearer ${SECRET}`))).status).toBe(
      400,
    );
    expect(
      (await POST(request({ tags: ["a b"] }, `Bearer ${SECRET}`))).status,
    ).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("is off (404) without a configured secret", async () => {
    delete process.env.REVALIDATE_SECRET;
    expect(
      (await POST(request({ tags: ["routes"] }, `Bearer ${SECRET}`))).status,
    ).toBe(404);
  });
});
