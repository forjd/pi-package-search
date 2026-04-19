import { describe, expect, it, vi } from "vitest";

import {
  buildSearchUrl,
  createSearchPiPackagesTool,
  searchPiPackages,
} from "../src/search-pi-packages.js";

describe("buildSearchUrl", () => {
  it("adds the pi-package keyword constraint and requested limit", () => {
    const url = buildSearchUrl("session search", 7);

    expect(url.origin).toBe("https://registry.npmjs.org");
    expect(url.pathname).toBe("/-/v1/search");
    expect(url.searchParams.get("text")).toBe(
      "keywords:pi-package session search",
    );
    expect(url.searchParams.get("size")).toBe("7");
  });

  it("omits the trailing query when the user gives an empty string", () => {
    const url = buildSearchUrl("   ", 5);

    expect(url.searchParams.get("text")).toBe("keywords:pi-package");
  });
});

describe("searchPiPackages", () => {
  it("maps npm search results into installable pi package results", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          total: 1,
          objects: [
            {
              package: {
                name: "@acme/pi-toolkit",
                version: "1.2.3",
                description: "Useful tools for pi.",
                date: "2026-04-19T10:00:00.000Z",
                keywords: ["pi-package", "tooling"],
                links: {
                  npm: "https://www.npmjs.com/package/@acme/pi-toolkit",
                  homepage: "https://example.com/pi-toolkit",
                },
              },
              score: {
                final: 0.91,
              },
              searchScore: 123.4,
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    const results = await searchPiPackages("toolkit", {
      fetchImpl: fetchMock,
      limit: 25,
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(results.total).toBe(1);
    expect(results.limit).toBe(20);
    expect(results.results).toEqual([
      {
        name: "@acme/pi-toolkit",
        version: "1.2.3",
        description: "Useful tools for pi.",
        date: "2026-04-19T10:00:00.000Z",
        installCommand: "pi install npm:@acme/pi-toolkit",
        npmUrl: "https://www.npmjs.com/package/@acme/pi-toolkit",
        homepageUrl: "https://example.com/pi-toolkit",
        score: 0.91,
      },
    ]);
  });

  it("throws when npm search fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("boom", {
        status: 503,
        statusText: "Service Unavailable",
      }),
    );

    await expect(
      searchPiPackages("broken", { fetchImpl: fetchMock }),
    ).rejects.toThrow("npm search failed with 503 Service Unavailable");
  });
});

describe("createSearchPiPackagesTool", () => {
  it("returns a tool that formats results for the model", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          total: 1,
          objects: [
            {
              package: {
                name: "@acme/pi-toolkit",
                version: "1.2.3",
                description: "Useful tools for pi.",
                date: "2026-04-19T10:00:00.000Z",
                keywords: ["pi-package"],
                links: {
                  npm: "https://www.npmjs.com/package/@acme/pi-toolkit",
                },
              },
              score: {
                final: 0.91,
              },
              searchScore: 123.4,
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );
    const tool = createSearchPiPackagesTool({ fetchImpl: fetchMock });

    const result = await tool.execute(
      "tool-call-1",
      { query: "toolkit", limit: 3 },
      undefined,
      undefined,
      {} as never,
    );
    const firstContent = result.content[0];

    expect(firstContent?.type).toBe("text");

    if (!firstContent || firstContent.type !== "text") {
      throw new Error("Expected text content");
    }

    expect(firstContent.text).toContain('Found 1 pi package for "toolkit"');
    expect(firstContent.text).toContain("pi install npm:@acme/pi-toolkit");
    expect(result.details).toMatchObject({
      query: "toolkit",
      total: 1,
      results: [
        {
          name: "@acme/pi-toolkit",
        },
      ],
    });
  });
});
