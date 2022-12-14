import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));

const PORT = 4000;
const handleListen = () => console.log(`Listening on http://localhost:${PORT}`);
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

wsServer.on(`connection`, (socket) => {
  socket.on(`join_room`, (roomName, nickName) => {
    socket.join(roomName);
    socket.to(roomName).emit(`welcome`, nickName);
  });
  socket.on(`offer`, (offer, roomName, nickName) => {
    socket.to(roomName).emit(`offer`, offer, nickName);
  });
  socket.on(`answer`, (answer, roomName) => {
    socket.to(roomName).emit(`answer`, answer);
  });
  socket.on(`ice`, (candi, roomName) => {
    socket.to(roomName).emit(`ice`, candi);
  });
});

httpServer.listen(PORT, handleListen);
