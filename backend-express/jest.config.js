module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/tests/setup.js"],
  testMatch: ["<rootDir>/tests/**/*.test.js"],

  // Cobertura: se mide el codigo de la API; index.js (arranque del servidor)
  // y prisma/client (wrapper de una linea) no tienen logica propia que probar.
  collectCoverageFrom: [
    "app.js",
    "routes/**/*.js",
    "controllers/**/*.js",
    "middleware/**/*.js",
    "utils/**/*.js",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "json-summary"],

  // Umbral minimo definido en el SQA Plan (60%). Si no se cumple, Jest falla
  // y con ello el pipeline.
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 60,
      functions: 60,
      lines: 60,
    },
  },
};
