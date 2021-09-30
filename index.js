const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const path = require("path");

const { makeId } = require("./src/utils")
const { initGame, connected_players, roomUsers } = require("./src/game")

const state = {};
const clientRooms = {};
const player = {
  0: "O",
  1: "X"
};

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  socket.on("joinGame", handleJoinGame);
  socket.on("newGame", handleNewGame);
  socket.on("cellUpdated", handleCellUpdated);
  socket.on("playerJoin", handlePlayerJoin);

  function handlePlayerJoin(name){
    let roomName = clientRooms[socket.id];
    let user = connected_players(name, roomName);
    io.sockets.in(roomName).emit("playerJoined", roomUsers(user.room));
  }

  function handleJoinGame(roomName) {
    const room = io.sockets.adapter.rooms.get(roomName);
    let numClients = 0;
    if (room) {
      numClients = room.size;
    }

    if (numClients === 0) {
      socket.emit("unknownCode");
      return;
    } else if (numClients > 1) {
      socket.emit("tooManyPlayers");
      return;
    }

    clientRooms[socket.id] = roomName;

    socket.join(roomName);
    socket.number = 2;
    socket.emit("init", 2);
  }

  function handleNewGame() {
    let roomName = makeId();
    clientRooms[socket.id] = roomName;
    socket.emit("gameCode", roomName);

    state[roomName] = initGame();

    socket.join(roomName);
    socket.number = 1;
    socket.emit("init", 1);
  }

  function handleCellUpdated(playerDetails) {
    let roomName = clientRooms[socket.id];
    const { id, turn } = playerDetails;
    state[roomName].board[id] = player[turn];
    state[roomName].moves += 1;
    const winner = check_winner(state[roomName], { id, turn });
    if (typeof winner !== "number") {
      io.sockets.in(roomName).emit("gameState", JSON.stringify({state, id}));
    }else{
      io.sockets.in(roomName).emit("gameOver", JSON.stringify({ winner }));
    }
  }
})

function check_winner(state, { id, turn }) {
  let plays = state.board.reduce((a, e, i) =>
    (e === player[turn]) ? a.concat(i) : a, []);
  for (let [index, win] of state.winner_combo.entries()) {
    if (win.every(elem => plays.indexOf(elem) > -1)) {
      return turn;
    }
  }
  if(state.moves === 9){
    return 3;
  }
  return false;
}

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
})

server.listen(3000, () => console.log("Running on Port 3000"));