import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import cors from "cors";
import { runCode } from "./runner.js";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/run", async (req, res) => {
  const { language, code, stdin } = req.body;
  if (!language || code === undefined) {
    return res.status(400).json({ error: "Language and code are required fields." });
  }
  try {
    const result = await runCode(language, code, stdin);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const rooms = new Map();
const roomCodes = new Map();
const roomLanguages = new Map();

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);

  let currentRoom = null;
  let currentUser = null;

  socket.on("join", ({ roomId, userName }) => {
    if (currentRoom) {
      socket.leave(currentRoom);
      rooms.get(currentRoom).delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
    }
  
    currentRoom = roomId;
    currentUser = userName;
    socket.join(roomId);
  
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
  
    rooms.get(roomId).add(userName);
  
    io.to(roomId).emit("userJoined", Array.from(rooms.get(currentRoom)));
    if (roomCodes.has(roomId)) {
        socket.emit("codeUpdate", roomCodes.get(roomId));
      }
    if (roomLanguages.has(roomId)) {
        socket.emit("languageUpdate", roomLanguages.get(roomId));
      }
  });

  socket.on("codeChange", ({ roomId, code }) => {
    roomCodes.set(roomId, code); 
    socket.to(roomId).emit("codeUpdate", code);
  });

  socket.on("inputChange", ({ roomId, input }) => {
    socket.to(roomId).emit("inputUpdate", input);
  });

  socket.on("runStart", ({ roomId }) => {
    socket.to(roomId).emit("runStarted");
  });

  socket.on("runEnd", ({ roomId, output }) => {
    socket.to(roomId).emit("runEnded", output);
  });

  socket.on("leaveRoom", () => {
    if (currentRoom && currentUser) {
      rooms.get(currentRoom).delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));

      socket.leave(currentRoom);

      currentRoom = null;
      currentUser = null;
    }
  });

  socket.on("typing", ({ roomId, userName }) => {
    socket.to(roomId).emit("userTyping", userName);
  });

  socket.on("languageChange", ({ roomId, language }) => {
    roomLanguages.set(roomId, language);
    io.to(roomId).emit("languageUpdate", language);
  });

  socket.on("disconnect", () => {
    if (currentRoom && currentUser) {
      rooms.get(currentRoom).delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
    }
    console.log("user Disconnected");
  });
});

const port = process.env.PORT || 3000;

const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get("*", (req, res) => {  
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
  });

server.listen(port, () => {
  console.log("server is working on port 3000");
});