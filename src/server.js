import express, { json } from "express";
import http from "http";
import WebSocket from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));

const PORT = 4000;
const handleListen = () => console.log(`Listening on http://localhost:${PORT}`);
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const Sockets = [];

wss.on("connection", (fSocket) => {
  Sockets.push(fSocket);
  fSocket["nickname"] = "Anon";
  fSocket.on("message", (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case "New_message":
        Sockets.forEach((aSocket) =>
          aSocket.send(`${fSocket.nickname}: ${message.content}`)
        );
        break;
      case "nickname":
        fSocket["nickname"] = message.content;
        break;
    }
  });
});
server.listen(PORT, handleListen);
