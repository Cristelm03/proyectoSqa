import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.js";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      setupFiles: ["./tests/setup.js"],
      include: ["tests/**/*.test.{js,jsx}"],
      css: false,
      coverage: {
        provider: "v8",
        // Se mide el codigo de la aplicacion; main.jsx solo monta React en el DOM
        // (sin logica propia que probar), igual que index.js en el backend.
        include: ["src/**/*.{js,jsx}"],
        exclude: ["src/main.jsx"],
        reporter: ["text", "lcov", "json-summary"],
        reportsDirectory: "coverage",
        // Umbral minimo definido en el SQA Plan (60%). Si no se cumple, Vitest falla
        // y con ello el pipeline.
        thresholds: {
          statements: 60,
          branches: 60,
          functions: 60,
          lines: 60,
        },
      },
    },
  })
);
