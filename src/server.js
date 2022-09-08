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

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}
function liveUser(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on(`connection`, (socket) => {
  socket["nickname"] = "Anon";
  // socket.onAny((event) => {
  //   console.log(wsServer.sockets.adapter);
  // });
  socket.on(`new_room`, (roomName, nickname, done) => {
    if (nickname !== undefined) {
      socket.nickname = nickname;
    }
    socket.join(roomName);
    socket
      .to(roomName)
      .emit(`welcome_msg`, socket.nickname, liveUser(roomName));
    wsServer.sockets.emit(`room_change`, publicRooms());
    done();
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("goodBye", socket.nickname, liveUser(room) - 1)
    );
  });
  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });
  socket.on(`new_msg`, (message, room, done) => {
    socket.to(room).emit(`new_msg`, `${socket.nickname}:${message}`);
    done();
  });
  socket.on(`new_nick`, (newNickname, oldNickname) => {
    socket.nickname = newNickname;
    socket.rooms.forEach((room) =>
      socket.to(room).emit("alertNickChange", socket.nickname, oldNickname)
    );
  });
});

httpServer.listen(PORT, handleListen);
