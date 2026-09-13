// Single-process development server for restricted desktop runtimes.
import next from "next";
import { createServer } from "node:http";
const app = next({
  dev: true,
  hostname: "127.0.0.1",
  port: 3000,
  webpack: true,
});
await app.prepare();
createServer(app.getRequestHandler()).listen(3000, "127.0.0.1", () =>
  console.log("Academy preview: http://127.0.0.1:3000"),
);
