const express = require("express");
const fs = require("fs");
const router = express.Router();

router.get(["/", "/index.html"], (req, res) => {
    console.log(`${req.method} ${req.url}`);
    res.send(`<p>This is an Express site, running on Node.js ${process.version}.</p>
              <p>Links: <a href="${req.baseUrl}${req.url}">Self</a>,
                        <a href="${req.baseUrl}/">Root</a>,
                        <a href="${req.baseUrl}/page">Sub-page</a></p>`);
});

const socket = process.argv[2] || 8000;
const mount = process.argv[3] || "/";

if (!process.argv[2]) {
    console.warn(`No socket provided. Default to port 8000.`);
    console.warn(`Usage: ${process.argv[1]} <socket> [mount]`);
}

if (fs.existsSync(socket)) fs.unlinkSync(socket);

const app = express();
app.use(mount, router);

const server = app.listen(socket, () => console.log(`Ready for requests (socket: ${socket}, mount: ${mount})`));

server.on("close", () => process.exit(0));

process.on("SIGTERM", () => server.close());
process.on("SIGINT",  () => server.close());
