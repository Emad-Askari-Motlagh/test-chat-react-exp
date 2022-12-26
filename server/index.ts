const express = require("express");

const app = express();
const cors = require("cors");
const JWT = require("jsonwebtoken");
const path = require("path");
const http = require("http").Server(app);

const PORT = 5000;
const socketIO = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});
app.use(express.urlencoded({ extended: true }));
app.use(cors());

let users = [];
// const privateMessage = socketIO.of("/private");
// privateMessage.use((socket, next) => {
//   if (socket.request.headers["authorization"] === "secret") {
//     return next();
//   } else {
//     return next(new Error("Authorization Error"));
//   }
// });
socketIO.on("connection", (socket) => {
  socketIO.emit("me", socket.id);

  socketIO.on("callUser", ({ userToCall, signalData, from, name }) => {
    socketIO
      .to(userToCall)
      .emit("callUser", { signal: signalData, from, name });
  });

  socket.on("answerCall", (data) => {
    socketIO.to(data.to).emit("callAccepted", data.signal);
  });

  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on("message", (data) => {
    socketIO.emit("messageResponse", data);
  });

  socket.on("typing", (data) => socketIO.emit("typingResponse", data));

  socket.on("newUser", (data) => {
    users.push(data);
    socketIO.emit("newUserResponse", users);
  });

  socket.on("disconnect", () => {
    console.log("🔥: A user disconnected");
    users = users.filter((user) => user.socketID !== socket.id);
    socketIO.emit("newUserResponse", users);
    socket.disconnect();
  });
});
app.use(express.static("public"));

//Route to the homepage of the application
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});
app.get("/api", (req, res) => {
  res.json({ message: "Hello" });
});
app.post("/api/auth/signup", (req, res) => {
  const { username, password } = req.body;
  const token = JWT.sign({ username, password }, "MY_SECRET");
  res.status(200).send(token);
});
http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

// socketIO.use((socket, next) => {
//   const username = socket.handshake.auth.username;
//   if (!username) {
//     return next(new Error("invalid username"));
//   }
//   socket.username = username;
//   next();
// });
