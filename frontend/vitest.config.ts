import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "html", "lcov"],
      include: ["src/**"],
      // Infra/glue that needs integration (not unit) tests, plus pure-markup
      // boundary files with no logic. Excluded so the gate reflects testable code.
      exclude: [
        "src/middleware.ts",
        "src/auth/**",
        "src/lib/db.ts",
        "src/app/dashboard/**",
        "src/app/layout.tsx",
        "src/app/error.tsx",
        "src/app/global-error.tsx",
        "src/app/loading.tsx",
        "src/app/not-found.tsx",
        "**/*.d.ts",
      ],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70,
      },
    },
  },
});
