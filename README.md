# Realtime Coder

A real-time collaborative code editor where multiple users can join a shared room and write code together simultaneously.

## Features

- Real-time code sync across all users in a room
- Multi-language support: JavaScript, Python, C++, Java
- Live typing indicators
- Room-based sessions with shareable Room IDs
- Language sync across all users
- Existing code visible to newly joined users

## Tech Stack

**Frontend**
- React
- Monaco Editor
- Socket.IO Client

**Backend**
- Node.js
- Express
- Socket.IO

## Getting Started

### Prerequisites

- Node.js v18+
- npm

### Installation

1. Clone the repository

2. Install backend dependencies

```bash
npm install
```

3. Install frontend dependencies

```bash
cd frontend
npm install
```

### Running the App

Start the backend from the root directory:

```bash
npm run dev
```

Start the frontend:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

## Usage

1. Enter a Room ID and your name to join or create a room
2. Share the Room ID with others so they can join the same session
3. Write code in the editor — changes sync live across all users
4. Select a language from the dropdown — syncs for everyone in the room
5. Click **Copy Id** to copy the Room ID to your clipboard

## Project Structure

```
realtime-coder/
├── backend/
│   └── index.js        # Express + Socket.IO server
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── App.css
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
