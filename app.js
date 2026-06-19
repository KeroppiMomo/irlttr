const express = require("express");
const fs = require("fs");
const apiRouter = require("./api.js");

const socket = process.argv[2] || 8000;
const mount = process.argv[3] || "/";

if (!process.argv[2]) {
    console.warn(`No socket provided. Default to port 8000.`);
    console.warn(`Usage: ${process.argv[1]} <socket> [mount]`);
}

if (fs.existsSync(socket)) fs.unlinkSync(socket);

const app = express();
app.use(mount, apiRouter);
app.use(express.static("public"));

const server = app.listen(socket, () => console.log(`Ready for requests (socket: ${socket}, mount: ${mount})`));

server.on("close", () => process.exit(0));

process.on("SIGTERM", () => server.close());
process.on("SIGINT",  () => server.close());
