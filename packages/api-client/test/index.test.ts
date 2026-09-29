import { describe, expect, it, vi } from "vitest";
import { ApiClientError, createApiClient } from "../src/index.js";

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

describe("API client", () => {
  it("handles success and auth/correlation headers", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        jsonResponse({ ok: true, data: { id: "org_acme" }, correlationId: "corr" }),
      );
    const result = await createApiClient({
      baseUrl: "https://api.example.test",
      getToken: () => "token",
      fetchImpl,
    }).request<{ id: string }>("/organizations");
    expect(result).toEqual({ id: "org_acme" });
    const request = fetchImpl.mock.calls[0]?.[1];
    expect(new Headers(request?.headers).get("authorization")).toBe("Bearer token");
    expect(new Headers(request?.headers).get("x-request-id")).toBeTruthy();
  });

  it("maps validation and unauthorized errors", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse(
        {
          ok: false,
          error: {
            code: "BAD_REQUEST",
            message: "Invalid",
            correlationId: "corr",
            fields: [{ field: "name", message: "Required" }],
          },
        },
        400,
      ),
    );
    await expect(
      createApiClient({ baseUrl: "https://api.example.test", fetchImpl }).request(
        "/organizations",
        { method: "POST" },
      ),
    ).rejects.toMatchObject({ code: "BAD_REQUEST", status: 400, fields: [{ field: "name" }] });
    fetchImpl.mockResolvedValue(
      jsonResponse(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Sign in", correlationId: "corr" } },
        401,
      ),
    );
    await expect(
      createApiClient({ baseUrl: "https://api.example.test", fetchImpl }).request("/organizations"),
    ).rejects.toBeInstanceOf(ApiClientError);
  });

  it("maps timeout and network failures", async () => {
    const timeoutFetch = vi
      .fn<typeof fetch>()
      .mockImplementation(
        (_input, init) =>
          new Promise((_resolve, reject) =>
            init?.signal?.addEventListener("abort", () =>
              reject(new DOMException("aborted", "AbortError")),
            ),
          ),
      );
    await expect(
      createApiClient({
        baseUrl: "https://api.example.test",
        timeoutMs: 1,
        fetchImpl: timeoutFetch,
      }).request("/slow"),
    ).rejects.toMatchObject({ code: "TIMEOUT", status: 408 });
    const networkFetch = vi.fn<typeof fetch>().mockRejectedValue(new Error("offline"));
    await expect(
      createApiClient({ baseUrl: "https://api.example.test", fetchImpl: networkFetch }).request(
        "/offline",
      ),
    ).rejects.toMatchObject({ code: "NETWORK_ERROR", status: 0 });
  });
});
