const nextJest = require("next/jest");

// next/jestを使ってNext.jsの設定を読み込む
const createJestConfig = nextJest({
  // テスト環境のNext.jsアプリのパスを指定
  dir: "./",
});

// Jestに渡すカスタム設定
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

// createJestConfigは、next/jestが非同期でNext.jsの設定を読み込むため、
// エクスポートする必要があります
module.exports = createJestConfig(customJestConfig);
