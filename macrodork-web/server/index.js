import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import Stripe from "stripe";
import { readConfig } from "./config.js";
import { openStore } from "./store.js";
import { createApp } from "./app.js";
try {
  process.loadEnvFile();
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const config = readConfig();
if (config.enabled && !config.ready)
  throw new Error(
    `Preorders were enabled with incomplete configuration: ${config.errors.join("; ")}`,
  );
const stripe = config.stripeKey
  ? new Stripe(config.stripeKey, { maxNetworkRetries: 2, timeout: 15_000 })
  : null;
const root = fileURLToPath(new URL("..", import.meta.url));
if (config.production && config.enabled && !process.env.ORDER_DB_PATH)
  throw new Error(
    "Set ORDER_DB_PATH to persistent storage before enabling production preorders",
  );
const store = openStore(
  resolve(process.env.ORDER_DB_PATH || resolve(root, "var/orders.sqlite")),
);
const app = createApp({
  config,
  stripe,
  store,
  distPath: resolve(root, "dist"),
  trustProxy: process.env.TRUST_PROXY_HOPS
    ? Number(process.env.TRUST_PROXY_HOPS)
    : false,
});
const server = app.listen(
  Number(process.env.PORT || 4242),
  process.env.HOST || "127.0.0.1",
  () =>
    console.log(
      `Mark 1 server listening on port ${process.env.PORT || 4242}; preorders ${config.ready ? "enabled" : "closed"}`,
    ),
);
function stop() {
  server.close(() => {
    store.close();
    process.exit(0);
  });
}
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
