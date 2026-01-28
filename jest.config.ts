import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["./jest.setup.ts"],
  roots: ["<rootDir>/src/tests"],

  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["html", "lcov", "text-summary"],
};

export default config;