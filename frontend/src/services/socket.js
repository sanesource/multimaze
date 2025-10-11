import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (this.socket?.connected) return this.socket;

    this.socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("Connected to server:", this.socket.id);
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Room management
  createRoom(username, settings, callback) {
    this.socket.emit("create-room", { username, settings }, callback);
  }

  joinRoom(roomCode, username, callback) {
    this.socket.emit("join-room", { roomCode, username }, callback);
  }

  leaveRoom() {
    this.socket.emit("leave-room");
  }

  // Game actions
  setReady(isReady) {
    this.socket.emit("player-ready", { isReady });
  }

  selectTeam(team) {
    this.socket.emit("select-team", { team });
  }

  startGame() {
    this.socket.emit("start-game");
  }

  restartRoom() {
    this.socket.emit("restart-room");
  }

  movePlayer(direction) {
    this.socket.emit("player-move", { direction });
  }

  useLightning() {
    this.socket.emit("use-lightning");
  }

  useTimeFreeze() {
    this.socket.emit("use-time-freeze");
  }

  // Event listeners
  on(event, callback) {
    this.socket?.on(event, callback);
  }

  off(event, callback) {
    this.socket?.off(event, callback);
  }

  getSocket() {
    return this.socket;
  }
}

export default new SocketService();
