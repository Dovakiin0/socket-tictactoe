const socket = io();

socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("gameOver", handleGameOver);
socket.on("gameCode", handleGameCode);
socket.on("unknownCode", handleUnknownCode);
socket.on("tooManyPlayers", handleTooManyPlayers);
socket.on("playerJoined", handlePlayerJoin);

var initial_screen = document.querySelector(".initial-screen");
var game_screen = document.querySelector(".game-screen");

initial_screen.style.display = "flex";
game_screen.style.display = "none";

var username = document.querySelector(".username-txt");
var room_code = document.querySelector(".display-code");
var code = document.querySelector(".code-txt");
var createBtn = document.querySelector(".create-btn");
var joinBtn = document.querySelector(".join-btn");

let cells = document.querySelectorAll("td")
var current_room

const player = {
  0: "O",
  1: "X"
};

let player_turn = 0;
var current_player;
var game_active = false;

createBtn.addEventListener("click", newGame);
joinBtn.addEventListener("click", joinGame);

function init() {
  initial_screen.style.display = "none";
  game_screen.style.display = "flex";

  gameActive = true;
}

function handleInit(number) {
  current_player = number;
}

function handleGameCode(code) {
  room_code.innerText = code;
  current_room = code
}

function handleGameOver(data) {
  if (!gameActive) return;
  data = JSON.parse(data);
  var players = document.querySelectorAll(".connected-players h2")
  gameActive = false;
  if (data.winner === current_player-1) {
    alert(`You Win!`);
  } else {
    alert(`${players[data.winner].innerText} has Won!`);
  }

}

function handlePlayerJoin(users) {
  const connected_users = document.querySelector(".connected-players");
  connected_users.innerHTML = "";
  for (let user of users) {
    var el = document.createElement("h2");
    el.innerText = user.username;
    connected_users.appendChild(el);
  }
}

function handleUnknownCode() {
  reset();
  alert("Unknown game code!");
}

function handleTooManyPlayers() {
  reset();
  alert("Game in Progess");
}

function reset() {
  initial_screen.style.display = "flex";
  game_screen.style.display = "none";
}


function newGame() {
  if (!username) return alert("Enter Username")
  socket.emit("newGame");
  socket.emit("playerJoin", username.value)
  init();
}

function joinGame() {
  if (!username.value) return alert("Enter Username")
  if (!code.value) return alert("Enter Valid Code!");
  socket.emit("joinGame", code.value.trim());
  socket.emit("playerJoin", username.value)
  room_code.innerText = code.value;
  init();
}

cells.forEach((val) => {
  val.addEventListener("click", () => {
    socket.emit("cellUpdated", { id: val.id, turn: player_turn });
  })
})

function handleGameState(gameState) {
  if (!gameActive) return;
  gameState = JSON.parse(gameState);
  update_cell(gameState.id, gameState.state);
}

function update_cell(id, state) {
  const valid = check_valid_moves(id);
  if (valid) {
    cells[id].innerText = player[player_turn];
    player_turn === 0 ? player_turn = 1 : player_turn = 0;
  }
}

function check_valid_moves(id) {
  if (cells[id].innerText === "") {
    return true;
  }
  return false;
}