const messageForm = document.querySelector("#message");
const nickForm = document.querySelector("#nickname");
const messageList = document.querySelector("ul");
const fSocket = new WebSocket(`ws://${window.location.host}`);

function sendMsg(type, content) {
  const msg = { type, content };
  return JSON.stringify(msg);
}

function handleSubmit(e) {
  e.preventDefault();
  const input = messageForm.querySelector("input");
  fSocket.send(sendMsg("New_message", input.value));
  input.value = "";
}
function handleNickSubmit(e) {
  e.preventDefault();
  const input = nickForm.querySelector("input");
  fSocket.send(sendMsg("nickname", input.value));
  input.value = "";
}

fSocket.addEventListener("message", (msg) => {
  const li = document.createElement("li");
  li.innerText = msg.data;
  messageList.append(li);
});

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);
