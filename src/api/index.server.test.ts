/**
 * @jest-environment node
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

const loadApi = async (apiUrl?: string) => {
  jest.resetModules();
  if (apiUrl === undefined) {
    delete process.env.API_URL;
  } else {
    process.env.API_URL = apiUrl;
  }
  const mod = await import("./index");
  return mod;
};

describe("API client (server runtime)", () => {
  let fetchMock: FetchMock;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue(jsonResponse({ ok: true })) as FetchMock;
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  afterAll(() => {
    delete process.env.API_URL;
  });

  it("uses process.env.API_URL as origin for GET requests", async () => {
    const { API } = await loadApi("https://api.example.com");

    await API.get("/posts");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://api.example.com/posts");
  });

  it("falls back to http://localhost:4000 when API_URL is unset", async () => {
    const { API } = await loadApi();

    await API.get("/posts/abc");

    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("http://localhost:4000/posts/abc");
  });

  it("strips a trailing slash from API_URL before joining the path", async () => {
    const { API } = await loadApi("https://api.example.com/");

    await API.get("/posts");

    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://api.example.com/posts");
  });

  it("serializes query params into the URL", async () => {
    const { API } = await loadApi("https://api.example.com");

    await API.get("/posts", { params: { cursor: "abc", limit: 10 } });

    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(
      "https://api.example.com/posts?cursor=abc&limit=10",
    );
  });

  it("omits undefined/null query params", async () => {
    const { API } = await loadApi("https://api.example.com");

    await API.get("/posts", { params: { cursor: undefined, limit: 10 } });

    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://api.example.com/posts?limit=10");
  });

  it("does not retry a 401 on the server when has_session cookie is absent", async () => {
    fetchMock.mockResolvedValueOnce(
      emptyResponse(401),
    );
    const { API, ApiError } = await loadApi("https://api.example.com");

    await expect(API.get("/posts")).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws ApiError with status + parsed JSON body on non-2xx", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ message: "boom" }, { status: 500, statusText: "Server Error" }),
    );
    const { API, ApiError } = await loadApi("https://api.example.com");

    const err = await API.get("/posts").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({
      name: "ApiError",
      status: 500,
      data: { message: "boom" },
    });
  });
});
