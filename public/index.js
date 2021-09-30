const socket = io();

socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("gameOver", handleGameOver);
socket.on("gameCode", handleGameCode);
socket.on("unknownCode", handleUnknownCode);
socket.on("tooManyPlayers", handleTooManyPlayers);
socket.on("playerJoined", handlePlayerJoin);
socket.on("restarted", handleRestart);

var initial_screen = document.querySelector(".initial-screen");
var game_screen = document.querySelector(".game-screen");

initial_screen.style.display = "flex";
game_screen.style.display = "none";

var username = document.querySelector(".username-txt");
var room_code = document.querySelector(".display-code");
var code = document.querySelector(".code-txt");
var createBtn = document.querySelector(".create-btn");
var joinBtn = document.querySelector(".join-btn");
var restartBtn = document.querySelector(".restart-btn");
var whose_turn = document.querySelector(".turn");

let cells = document.querySelectorAll("td")

const player = {
  0: "O",
  1: "X"
};

var current_users

let player_turn = 0;
var current_player;
var game_active = false;

createBtn.addEventListener("click", newGame);
joinBtn.addEventListener("click", joinGame);
restartBtn.addEventListener("click", restartGame);

function init() {
  initial_screen.style.display = "none";
  game_screen.style.display = "flex";
  game_active = true;
  restartBtn.style.display = "none";
  update_turn_text();
}

function restartGame(){
  socket.emit("restart", {current_player})
}

function handleRestart(){
  cells.forEach((val)=>{
    val.innerText = "";
  })
  init();
}

function handleInit(number) {
  current_player = number;
}

function handleGameCode(code) {
  room_code.innerText = code;
}

function handleGameOver(data) {
  if (!game_active) return;
  data = JSON.parse(data);
  var players = document.querySelectorAll(".connected-players h3")
  game_active = false;
  if (data.winner === 3) {
    alert("Game Draw!");
  }
  else if (data.winner === current_player - 1) {
    alert(`You Win!`);
  } else {
    alert(`${current_users[data.winner].username} has Won!`);
  }
  restartBtn.style.display = "block";
}

function handlePlayerJoin(users) {
  const connected_users = document.querySelector(".connected-players");
  connected_users.innerHTML = "";
  current_users = users;
  for (let user of users) {
    var el = document.createElement("h3");
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
    if (player_turn + 1 === current_player) {
      socket.emit("cellUpdated", { id: val.id, turn: player_turn });
    }
  })
})

function handleGameState(gameState) {
  if (!game_active) return;
  gameState = JSON.parse(gameState);
  update_cell(gameState.id, gameState.state);
}

function update_cell(id, state) {
  const valid = check_valid_moves(id);
  if (valid) {
    cells[id].innerText = player[player_turn];
    player_turn === 0 ? player_turn = 1 : player_turn = 0;
    update_turn_text();
  }
}

function update_turn_text(){
  if (player_turn + 1 === current_player) {
      whose_turn.innerText = "Your Turn";
    }else{
      if(current_player === 1){
        whose_turn.innerText = `${current_users[1].username}'s Turn'`
      }else{
        whose_turn.innerText = `${current_users[0].username}'s Turn'`
      }
    }
}

function check_valid_moves(id) {
  if (cells[id].innerText === "") {
    return true;
  }
  return false;
}