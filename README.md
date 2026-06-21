# Realtime Coder

A real-time collaborative code editor where multiple users can join a shared room, write code together, and execute it locally in real time.

---

## Features

- **Real-Time Code Sync**: Dynamic code editing synchronized across all users in a room.
- **Dynamic Code Execution**: Compile and run code directly from the browser with standard input (stdin) and output (stdout/stderr) support.
- **Collaborative Output**: Run status, input changes, and output results are broadcasted to all room members in real time.
- **Multi-Language Support**: Complete runtimes for **JavaScript**, **Python**, **C++**, and **Java**.
- **C++ stdc++.h Support**: Built-in macOS compilation support for GCC-style `#include <bits/stdc++.h>` headers.
- **Collaborative Features**: Live typing indicators, synced language selectors, and existing session preservation for newly joined room members.

---

## Tech Stack

**Frontend**
- React.js (Vite)
- Monaco Editor
- Axios
- Socket.IO Client

**Backend**
- Node.js & Express
- Socket.IO Server
- Child Process Spawn Runner

---

## Prerequisites (For Local Execution)

To run compilers and interpreters directly on your host machine, ensure you have the following installed:
- **Node.js** (v18+)
- **Python 3** (interpreted via `python3`)
- **GCC / G++ Compiler** (for C++ compilation)
- **Java Development Kit (JDK)** (for compiling & running Java classes)

---

## Getting Started

### 1. Installation

Clone the repository, then install dependencies for both the backend server and frontend client:

```bash
# Install root/backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Running Locally

Start both the backend server and frontend application:

```bash
# Build frontend and start the production Express app
npm run build && npm start
```

Or run in development mode (using Nodemon for backend and Vite dev server):

```bash
# Start backend server (port 3000)
npm run dev

# Start frontend development server (port 5173)
cd frontend
npm run dev
```

Open `http://localhost:3000` (or `http://localhost:5173` in development) to run the application.

---

## Docker Deployment (Recommended)

Using Docker encapsulates the code runner environment, installing all required compilers (Python, GCC, and Java OpenJDK) in a secure sandbox without cluttering your local machine.

### 1. Build the Docker Image
```bash
docker build -t realtime-coder .
```

### 2. Run the Container
```bash
docker run -p 3000:3000 -d --name realtime-editor-instance realtime-coder
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
realtime-coder/
├── backend/
│   ├── include/
│   │   └── bits/
│   │       └── stdc++.h  # Local bits/stdc++.h header compatibility library
│   ├── index.js          # Express + Socket.IO server
│   └── runner.js         # Child process code execution module
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Collaborative editor interface
│   │   └── App.css       # UI layout styles
│   └── package.json
├── Dockerfile            # Container configuration
├── .dockerignore
└── package.json
```

---

## Socket Events

| Event | Direction | Description |
|---|---|---|
| `join` | Client → Server | Join a room with `roomId` and `userName` |
| `userJoined` | Server → Client | Updated list of active users in the room |
| `codeChange` | Client → Server | Broadcast code changes |
| `codeUpdate` | Server → Client | Receive code changes from others |
| `typing` | Client → Server | Notify others that the user is typing |
| `userTyping` | Server → Client | Show typing indicator on client screen |
| `languageChange` | Client → Server | Broadcast language selection |
| `languageUpdate` | Server → Client | Receive language change from others |
| `inputChange` | Client → Server | Broadcast custom stdin changes |
| `inputUpdate` | Server → Client | Receive custom stdin changes from others |
| `runStart` | Client → Server | Broadcast code execution start |
| `runStarted` | Server → Client | Display running loaders for all users in the room |
| `runEnd` | Client → Server | Broadcast execution outputs |
| `runEnded` | Server → Client | Display output results to all users in the room |
| `leaveRoom` | Client → Server | Leave the current room session |
