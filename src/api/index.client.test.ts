/**
 * @jest-environment jsdom
 */

type MockResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  headers: { get: (name: string) => string | null };
  json: () => Promise<unknown>;
  text: () => Promise<string>;
};

type FetchMock = jest.Mock<Promise<MockResponse>, [RequestInfo | URL, RequestInit?]>;

const jsonResponse = (
  body: unknown,
  init: { status?: number; statusText?: string } = {},
): MockResponse => {
  const status = init.status ?? 200;
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: init.statusText ?? "OK",
    headers: {
      get: (name: string) =>
        name.toLowerCase() === "content-type" ? "application/json" : null,
    },
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  };
};

const emptyResponse = (status: number): MockResponse => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: "",
  headers: { get: () => null },
  json: () => Promise.resolve(null),
  text: () => Promise.resolve(""),
});

const loadApi = async () => {
  jest.resetModules();
  const mod = await import("./index");
  return mod;
};

describe("API client (browser runtime)", () => {
  let fetchMock: FetchMock;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue(jsonResponse({ ok: true })) as FetchMock;
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    document.cookie = "has_session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("uses the relative /api origin so Next.js rewrites apply", async () => {
    const { API } = await loadApi();

    await API.get("/posts");

    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("/api/posts");
  });

  it("appends query params on relative URLs", async () => {
    const { API } = await loadApi();

    await API.get("/posts", { params: { cursor: "abc", limit: 10 } });

    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("/api/posts?cursor=abc&limit=10");
  });

  it("attempts /auth/refresh once on 401 when has_session cookie is set", async () => {
    document.cookie = "has_session=1";

    fetchMock
      .mockResolvedValueOnce(emptyResponse(401))
      .mockResolvedValueOnce(emptyResponse(200))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));

    const { API } = await loadApi();

    await API.get("/posts");

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(String(fetchMock.mock.calls[0][0])).toBe("/api/posts");
    expect(String(fetchMock.mock.calls[1][0])).toBe("/api/auth/refresh");
    expect(String(fetchMock.mock.calls[2][0])).toBe("/api/posts");
  });

  it("does not retry on 401 when has_session cookie is absent", async () => {
    fetchMock.mockResolvedValueOnce(emptyResponse(401));

    const { API, ApiError } = await loadApi();

    await expect(API.get("/posts")).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
