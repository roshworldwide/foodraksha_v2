/**
 * DEVELOPMENT ONLY — a minimal, in-memory, S3-compatible object store so the
 * upload flow can be exercised without Cloudflare R2 credentials.
 *
 * It does NOT verify AWS signatures and it forgets everything on restart.
 * It is not a stand-in for R2's security behaviour and must never be used
 * for anything real. Point .env at a real bucket before deploying.
 *
 *   npm run dev:storage
 */
import { createServer } from "node:http";

if (process.env.NODE_ENV === "production") {
  console.error("dev-storage refuses to run with NODE_ENV=production");
  process.exit(1);
}

const objects = new Map(); // "bucket/key" -> { body: Buffer, contentType }
const PORT = Number(process.env.PORT ?? 4599);

function id(url) {
  return decodeURIComponent(url.split("?")[0]).replace(/^\//, "");
}

const server = createServer((req, res) => {
  const key = id(req.url);

  // Test helper: what does the store hold right now?
  if (key === "__objects") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify(
        [...objects.entries()].map(([k, v]) => ({
          key: k,
          bytes: v.body.length,
          contentType: v.contentType,
        })),
      ),
    );
    return;
  }
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,DELETE,HEAD,OPTIONS",
    "Access-Control-Allow-Headers": "*",
  };

  if (req.method === "OPTIONS") {
    res.writeHead(204, cors);
    res.end();
    return;
  }

  if (req.method === "PUT") {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      objects.set(key, {
        body: Buffer.concat(chunks),
        contentType: req.headers["content-type"] ?? "application/octet-stream",
      });
      console.log(`PUT    ${key} (${Buffer.concat(chunks).length} bytes)`);
      res.writeHead(200, { ...cors, ETag: '"fake"' });
      res.end();
    });
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    const object = objects.get(key);
    if (!object) {
      console.log(`GET    ${key} -> 404`);
      res.writeHead(404, cors);
      res.end("<Error><Code>NoSuchKey</Code></Error>");
      return;
    }
    console.log(`GET    ${key} (${object.body.length} bytes)`);
    res.writeHead(200, {
      ...cors,
      "Content-Type": object.contentType,
      "Content-Length": object.body.length,
    });
    res.end(req.method === "HEAD" ? undefined : object.body);
    return;
  }

  if (req.method === "DELETE") {
    console.log(
      `DELETE ${key} (${objects.delete(key) ? "removed" : "absent"})`,
    );
    res.writeHead(204, cors);
    res.end();
    return;
  }

  res.writeHead(405, cors);
  res.end();
});

// Loopback only — nothing outside this machine can reach it.
server.listen(PORT, "127.0.0.1", () => {
  console.log(`dev storage on http://127.0.0.1:${PORT} — in memory, unsigned`);
});

process.on("SIGTERM", () => server.close());
