import { defineTool } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 20;
const NPM_SEARCH_ENDPOINT = "https://registry.npmjs.org/-/v1/search";

export interface SearchPiPackageResult {
  name: string;
  version: string;
  description: string;
  date: string;
  installCommand: string;
  npmUrl: string;
  homepageUrl?: string;
  score: number;
}

export interface SearchPiPackagesResult {
  query: string;
  limit: number;
  total: number;
  results: SearchPiPackageResult[];
}

export interface SearchPiPackagesOptions {
  fetchImpl?: typeof fetch;
  limit?: number;
  signal?: AbortSignal;
}

interface NpmRegistrySearchResponse {
  total?: number;
  objects?: NpmRegistrySearchObject[];
}

interface NpmRegistrySearchObject {
  package?: {
    name?: string;
    version?: string;
    description?: string;
    date?: string;
    links?: {
      npm?: string;
      homepage?: string;
    };
  };
  score?: {
    final?: number;
  };
  searchScore?: number;
}

export function buildSearchUrl(query: string, limit = DEFAULT_LIMIT): URL {
  const url = new URL(NPM_SEARCH_ENDPOINT);

  url.searchParams.set("text", buildSearchText(query));
  url.searchParams.set("size", String(normalizeLimit(limit)));

  return url;
}

export async function searchPiPackages(
  query: string,
  options: SearchPiPackagesOptions = {},
): Promise<SearchPiPackagesResult> {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;

  if (!fetchImpl) {
    throw new Error("fetch is not available in this runtime");
  }

  const limit = normalizeLimit(options.limit);
  const response = await fetchImpl(buildSearchUrl(query, limit), {
    headers: {
      accept: "application/json",
    },
    signal: options.signal,
  });

  if (!response.ok) {
    throw new Error(
      `npm search failed with ${response.status} ${response.statusText}`.trim(),
    );
  }

  const payload = (await response.json()) as NpmRegistrySearchResponse;
  const results = (payload.objects ?? []).map(mapSearchResult);

  return {
    query: query.trim(),
    limit,
    total: typeof payload.total === "number" ? payload.total : results.length,
    results,
  };
}

export function formatSearchResults(result: SearchPiPackagesResult): string {
  const packageLabel =
    result.results.length === 1 ? "pi package" : "pi packages";
  const queryLabel = result.query ? ` for "${result.query}"` : "";

  if (result.results.length === 0) {
    return `Found no ${packageLabel}${queryLabel}. Try a broader query.`;
  }

  const heading = [
    `Found ${result.results.length} ${packageLabel}${queryLabel}`,
  ];

  if (result.total > result.results.length) {
    heading.push(
      `(${result.total} total matches, showing ${result.results.length})`,
    );
  }

  const formattedResults = result.results
    .map((packageResult, index) => formatSingleResult(index, packageResult))
    .join("\n\n");

  return `${heading.join(" ")}\n\n${formattedResults}`;
}

export function createSearchPiPackagesTool(
  options: SearchPiPackagesOptions = {},
) {
  return defineTool({
    name: "search_pi_packages",
    label: "Search Pi Packages",
    description:
      "Search npm for pi packages tagged with pi-package so the user can discover packages to install.",
    promptSnippet:
      "Search npm for pi packages tagged with pi-package and return package names plus pi install commands.",
    promptGuidelines: [
      "Use this tool when the user wants to find pi extensions, skills, prompts, themes, or other pi packages to install.",
    ],
    parameters: Type.Object({
      query: Type.String({
        description:
          "Search keywords, for example browser, session search, or git.",
      }),
      limit: Type.Optional(
        Type.Integer({
          minimum: 1,
          maximum: MAX_LIMIT,
          description: `Maximum number of results to return (1-${MAX_LIMIT}).`,
        }),
      ),
    }),
    async execute(_toolCallId, params, signal) {
      const result = await searchPiPackages(params.query, {
        fetchImpl: options.fetchImpl,
        limit: params.limit,
        signal,
      });

      return {
        content: [{ type: "text", text: formatSearchResults(result) }],
        details: result,
      };
    },
  });
}

function buildSearchText(query: string): string {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return "keywords:pi-package";
  }

  return `keywords:pi-package ${trimmedQuery}`;
}

function normalizeLimit(limit: number | undefined): number {
  if (limit === undefined || Number.isNaN(limit)) {
    return DEFAULT_LIMIT;
  }

  return Math.min(Math.max(Math.trunc(limit), 1), MAX_LIMIT);
}

function mapSearchResult(
  searchObject: NpmRegistrySearchObject,
): SearchPiPackageResult {
  const packageName = searchObject.package?.name ?? "unknown-package";

  return {
    name: packageName,
    version: searchObject.package?.version ?? "0.0.0",
    description:
      searchObject.package?.description ?? "No description provided.",
    date: searchObject.package?.date ?? "",
    installCommand: `pi install npm:${packageName}`,
    npmUrl:
      searchObject.package?.links?.npm ??
      `https://www.npmjs.com/package/${packageName}`,
    homepageUrl: searchObject.package?.links?.homepage,
    score: searchObject.score?.final ?? searchObject.searchScore ?? 0,
  };
}

function formatSingleResult(
  index: number,
  packageResult: SearchPiPackageResult,
): string {
  const lines = [
    `${index + 1}. ${packageResult.name}@${packageResult.version}`,
    `   ${packageResult.description}`,
    `   Install: ${packageResult.installCommand}`,
    `   npm: ${packageResult.npmUrl}`,
  ];

  if (packageResult.homepageUrl) {
    lines.push(`   homepage: ${packageResult.homepageUrl}`);
  }

  return lines.join("\n");
}
