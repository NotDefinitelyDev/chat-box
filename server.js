const express = require("express");
const app = express();
const port = 5000;
const { Server } = require("socket.io");

app.use(express.static("public"));

const server = app.listen(port, () => {
  console.log(`Server is on port ${port}`);
});

const io = new Server(server);

// Show online users
let activeUsers = [];

// Connection
io.on("connection", (socket) => {
  socket.username = "Unknown user";

  // User
  socket.on("set username", (username) => {
    socket.username = username || "Unknown user";
    activeUsers.push({ id: socket.id, username: username });
    io.emit("update user list", activeUsers);
    io.emit("user joined", {
      userName: socket.username,
    });
  });

  // Chat
  socket.on("chat message", (msg) => {
    io.emit("chat message", {
      username: socket.username,
      message: msg,
      timestamp: new Date().toISOString(),
    });
  });

  // Typing
  socket.on("typing", () => {
    socket.broadcast.emit("typing", socket.username);
  });

  // disconnect
  socket.on("disconnect", () => {
    console.log("user disconnected");
    activeUsers = activeUsers.filter((user) => user.id !== socket.id);
    io.emit("update user list", activeUsers);
    if (socket.username !== "Unknown user") {
      io.emit("user left", { userName: socket.username });
    }
  });
});
