const socket = io();

const myFace = document.querySelector(`#myFace`);
const muteBtn = document.querySelector(`#mute`);
const cameraBtn = document.querySelector(`#camera`);
const selectCamera = document.querySelector(`#cameras`);
const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let PeerConnection;
peerFace;
async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      selectCamera.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}
async function getMedia(deviceId) {
  const initialConstrains = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstrains
    );
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}

async function handleCamChange() {
  await getMedia(selectCamera.value);
  if (PeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = PeerConnection.getSenders().find(
      (sender) => sender.track.kind === "video"
    );
    videoSender.replaceTrack(videoTrack);
  }
}

function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    muteBtn.innerText = `unMute`;
    muted = true;
  } else {
    muteBtn.innerText = `Mute`;
    muted = false;
  }
}
function handleCamClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!cameraOff) {
    cameraBtn.innerText = `Camera On`;
    cameraOff = true;
  } else {
    cameraBtn.innerText = `Camera Off`;
    cameraOff = false;
  }
}

muteBtn.addEventListener(`click`, handleMuteClick);
cameraBtn.addEventListener(`click`, handleCamClick);
selectCamera.addEventListener("input", handleCamChange);

//Join a Room

const joinRoom = document.querySelector(`#joinRoom`);
const joinForm = joinRoom.querySelector(`form`);

async function startMedia() {
  joinRoom.hidden = true;
  call.hidden = false;
  await getMedia();
  makePeer();
}

async function handleJoinSubmit(e) {
  e.preventDefault();
  const input = joinForm.querySelector(`input`);
  await startMedia();
  roomName = input.value;
  socket.emit(`join_room`, input.value);
  input.value = "";
}

joinForm.addEventListener(`submit`, handleJoinSubmit);

// Socket

socket.on(`welcome`, async () => {
  const offer = await PeerConnection.createOffer();
  PeerConnection.setLocalDescription(offer);
  socket.emit(`offer`, offer, roomName);
});

socket.on(`offer`, async (offer) => {
  PeerConnection.setRemoteDescription(offer);
  const answer = await PeerConnection.createAnswer();
  PeerConnection.setLocalDescription(answer);
  socket.emit(`answer`, answer, roomName);
});
socket.on(`answer`, (answer) => {
  PeerConnection.setRemoteDescription(answer);
});
socket.on(`ice`, (ice) => {
  PeerConnection.addIceCandidate(ice);
});
//RTC

function makePeer() {
  PeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });
  PeerConnection.addEventListener(`icecandidate`, handleIce);
  PeerConnection.addEventListener(`addstream`, handleAddStream);
  myStream
    .getTracks()
    .forEach((track) => PeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
  socket.emit(`ice`, data.candidate, roomName);
}

function handleAddStream(data) {
  const peerFace = document.querySelector(`#peerFace`);
  peerFace.srcObject = data.stream;
}
