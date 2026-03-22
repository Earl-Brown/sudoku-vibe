const fs = require("fs");
const http = require("http");
const path = require("path");

const root = path.join(process.cwd(), "out");
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".webp": "image/webp"
};

function sendFile(response, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  response.writeHead(200, {
    "Content-Type": mimeTypes[ext] || "application/octet-stream",
    "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600"
  });
  fs.createReadStream(filePath).pipe(response);
}

function resolvePath(urlPath) {
  const cleanPath = urlPath.split("?")[0].split("#")[0];
  const relativePath = cleanPath === "/" ? "/index.html" : cleanPath;
  const directPath = path.join(root, relativePath);

  if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
    return directPath;
  }

  if (!path.extname(directPath)) {
    const htmlPath = `${directPath}.html`;
    if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) {
      return htmlPath;
    }

    const nestedIndex = path.join(directPath, "index.html");
    if (fs.existsSync(nestedIndex) && fs.statSync(nestedIndex).isFile()) {
      return nestedIndex;
    }
  }

  return path.join(root, "404.html");
}

if (!fs.existsSync(root)) {
  console.error("Missing out/ directory. Run `npm run build` first.");
  process.exit(1);
}

const server = http.createServer((request, response) => {
  const filePath = resolvePath(request.url || "/");
  if (!fs.existsSync(filePath)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  if (filePath.endsWith("404.html")) {
    response.statusCode = 404;
  }

  sendFile(response, filePath);
});

server.listen(port, () => {
  console.log(`Previewing static export at http://localhost:${port}`);
});
