
module.exports = {
  initGame,
  createGameState,
  connected_players,
  roomUsers
}

let users = []

function initGame() {
  const state = createGameState();
  return state;
}

function connected_players(username, room) {
  let user = {username, room}
  users.push(user);
  return user;
}

function roomUsers(room){
  return users.filter((user) => user.room === room);
}

function createGameState() {
  return {
    board : Array.from(Array(9).keys()),
    winner_combo: [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ]
  }
}
