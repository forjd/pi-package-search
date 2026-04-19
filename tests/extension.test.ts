import { describe, expect, it } from "vitest";

import extension from "../extensions/index.ts";

describe("extension", () => {
  it("registers the pi package search and install tools", () => {
    const registeredTools: Array<{ name: string }> = [];

    extension({
      registerTool(tool: { name: string }) {
        registeredTools.push(tool);
      },
    } as never);

    expect(registeredTools).toHaveLength(2);
    expect(registeredTools.map((tool) => tool.name)).toEqual([
      "search_pi_packages",
      "install_pi_package",
    ]);
  });
});
