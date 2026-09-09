// Visible, isolated Chrome review. Close the window or press Ctrl+C to finish.
import { chromium } from "@playwright/test";
const browser = await chromium.launch({
  channel: "chrome",
  headless: false,
  args: ["--window-position=4000,40", "--window-size=1940,1350"],
});
const page = await browser.newPage({ viewport: null });
await page.goto("http://127.0.0.1:4242");
const session = await page.context().newCDPSession(page);
const { windowId } = await session.send("Browser.getWindowForTarget");
await session.send("Browser.setWindowBounds", {
  windowId,
  bounds: {
    left: 4000,
    top: 40,
    width: 1940,
    height: 1350,
    windowState: "normal",
  },
});
console.log(
  "Mark 1 is open on LG. Close Chrome or press Ctrl+C to end this foreground review.",
);
process.on("SIGINT", () => browser.close());
await new Promise((resolve) => browser.on("disconnected", resolve));
