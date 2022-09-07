const socket = io();
const startRoom = document.querySelector(`#start`);
const room = document.querySelector(`#room`);

room.hidden = true;

let roomName;

function addMessage(message) {
  const ul = room.querySelector(`ul`);
  const li = document.createElement(`li`);
  li.innerText = message;
  ul.append(li);
}

function handleStartSubmit(e) {
  e.preventDefault();
  const nameInput = startRoom.querySelector(`input`);
  socket.emit(`new_room`, nameInput.value, showRoom);
  roomName = nameInput.value;
  nameInput.value = "";
}

function handleMessageSubmit(e) {
  e.preventDefault();
  const input = room.querySelector(`input`);
  const message = input.value;
  socket.emit(`new_msg`, message, roomName, () => {
    addMessage(`You:${message}`);
  });
  input.value = "";
}

function showRoom() {
  startRoom.hidden = true;
  room.hidden = false;
  const roomTitle = room.querySelector(`h3`);
  roomTitle.innerText = `Room : ${roomName}`;
  const form = room.querySelector(`form`);
  form.addEventListener(`submit`, handleMessageSubmit);
}
socket.on("new_msg", addMessage);
startRoom.addEventListener(`submit`, handleStartSubmit);
