import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import { paths } from "./lib.mjs";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".wasm": "application/wasm",
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", "http://localhost:5006");
    const relativePath = decodeURIComponent(url.pathname)
      .replace(/^\/help\/?/, "")
      .replace(/^\/+/, "");
    const root = path.resolve(paths.dist);
    let file = path.resolve(root, relativePath);
    if (file !== root && !file.startsWith(root + path.sep)) {
      response.writeHead(400).end("Invalid path");
      return;
    }
    const fileStat = await stat(file);
    if (fileStat.isDirectory()) {
      file = path.join(file, "index.html");
    }
    const body = await readFile(file);
    response.setHeader(
      "Content-Type",
      contentTypes[path.extname(file)] ?? "application/octet-stream",
    );
    response.end(body);
  } catch {
    response.statusCode = 404;
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end(await readFile(path.join(paths.dist, "404.html")));
  }
});

server.listen(5006, () => {
  console.log("iden Help is available at http://localhost:5006/help/en/");
});
