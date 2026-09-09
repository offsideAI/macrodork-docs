import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "website.spec.js",
  workers: 1,
  timeout: 30000,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4242",
    headless: false,
    channel: "chrome",
    viewport: { width: 1440, height: 1050 },
    reducedMotion: "reduce",
    launchOptions: {
      args: ["--window-position=4000,80", "--window-size=1500,1150"],
    },
    screenshot: "only-on-failure",
  },
});
