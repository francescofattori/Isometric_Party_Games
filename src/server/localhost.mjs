import express from "express";
import http from "http";
const app = express();
const server = http.createServer(app);
app.use(express.static("./"));
app.get("/", (req, res) => {
    res.redirect("/games/hub/");
});
server.listen(8080, "localhost");