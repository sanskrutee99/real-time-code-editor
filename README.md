# Realtime Coder

A real-time collaborative code editor where multiple users can join a shared room, write code together, and execute it instantly.

## Features

- Real-time code collaboration using WebSockets
- Multi-language support: JavaScript, Python, C++, Java
- Live typing indicators
- Code execution with stdin support via Piston API
- Room-based sessions with shareable Room IDs
- Language sync across all users in a room
- Existing code visible to newly joined users

## Tech Stack

**Frontend**
- React
- Monaco Editor
- Socket.IO Client
- Axios

**Backend**
- Node.js
- Express
- Socket.IO



## Usage

1. Enter a Room ID and your name to join or create a room
2. Share the Room ID with others so they can join the same session
3. Write code in the editor — changes sync live across all users
4. Select a language from the dropdown — language syncs for everyone


## Project Structure

```
realtime-coder/
├── backend/
│   └── index.js        # Express + Socket.IO server
├── frontend/
│   ├── src/
│   │   ├── App.jsx     # Main React component
│   │   └── App.css     # Styles
│   └── package.json
└── package.json
```

## Socket Events

| Event | Direction | Description |
|---|---|---|
| `join` | Client → Server | Join a room with roomId and userName |
| `userJoined` | Server → Client | Updated list of users in the room |
| `codeChange` | Client → Server | Broadcast code changes |
| `codeUpdate` | Server → Client | Receive code changes from others |
| `typing` | Client → Server | Notify others the user is typing |
| `userTyping` | Server → Client | Show typing indicator |
| `languageChange` | Client → Server | Broadcast language selection |
| `languageUpdate` | Server → Client | Receive language change from others |
| `leaveRoom` | Client → Server | Leave the current room |
