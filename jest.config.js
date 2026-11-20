/* eslint-disable no-undef */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: { module: "commonjs", moduleResolution: "node", isolatedModules: true, esModuleInterop: true, types: ["jest", "node", "office-js"] }, diagnostics: { warnOnly: false } }],
  },
  moduleFileExtensions: ["ts", "js", "json"],
};
