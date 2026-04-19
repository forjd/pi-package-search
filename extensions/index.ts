import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

import { createInstallPiPackageTool } from "../src/install-pi-package.js";
import { createSearchPiPackagesTool } from "../src/search-pi-packages.js";

export default function extension(pi: ExtensionAPI) {
  pi.registerTool(createSearchPiPackagesTool());
  pi.registerTool(
    createInstallPiPackageTool({
      execImpl(command, args, options) {
        return pi.exec(command, args, options);
      },
    }),
  );
}
