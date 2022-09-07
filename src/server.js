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
  socket.on(`new_room`, (roomName, done) => {
    socket.join(roomName);
    done();
  });
  socket.on(`new_msg`, (message, room, done) => {
    console.log(room);
    console.log(message);
    socket.to(room).emit(`new_msg`, message);
    done();
  });
});

httpServer.listen(PORT, handleListen);
