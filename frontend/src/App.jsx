import { useEffect, useState } from "react";
import "./App.css";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";
import axios from "axios";

const BACKEND_URL = window.location.hostname === "localhost" ? "http://localhost:3000" : window.location.origin;
const socket = io(BACKEND_URL);

const App = () => {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// start code here");
  const [copySuccess, setCopySuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    socket.on("userJoined", (users) => {
      setUsers(users);
    });

    socket.on("codeUpdate", (newCode) => {
      setCode(newCode);
    });

    socket.on("userTyping", (user) => {
      setTyping(`${user} is Typing`);
      setTimeout(() => setTyping(""), 2000);
    });

    socket.on("languageUpdate", (newLanguage) => {
      setLanguage(newLanguage);
    });

    socket.on("inputUpdate", (newInput) => {
      setInput(newInput);
    });

    socket.on("runStarted", () => {
      setRunning(true);
    });

    socket.on("runEnded", (newOutput) => {
      setRunning(false);
      setOutput(newOutput);
    });

    return () => {
      socket.off("userJoined");
      socket.off("codeUpdate");
      socket.off("userTyping");
      socket.off("languageUpdate");
      socket.off("inputUpdate");
      socket.off("runStarted");
      socket.off("runEnded");
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.emit("leaveRoom");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const joinRoom = () => {
    if (roomId && userName) {
      socket.emit("join", { roomId, userName });
      setJoined(true);
    }
  };

  const leaveRoom = () => {
    socket.emit("leaveRoom");
    setJoined(false);
    setRoomId("");
    setUserName("");
    setCode("// start code here");
    setLanguage("javascript");
    setInput("");
    setOutput("");
    setRunning(false);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopySuccess("Copied!");
    setTimeout(() => setCopySuccess(""), 2000);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("codeChange", { roomId, code: newCode });
    socket.emit("typing", { roomId, userName });
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    socket.emit("languageChange", { roomId, language: newLanguage });
  };

  const handleInputChange = (e) => {
    const newInput = e.target.value;
    setInput(newInput);
    socket.emit("inputChange", { roomId, input: newInput });
  };

  const runCode = async () => {
    setRunning(true);
    setOutput("Executing code...");
    socket.emit("runStart", { roomId });
    
    try {
      const response = await axios.post(`${BACKEND_URL}/api/run`, {
        language,
        code,
        stdin: input
      });
      
      const { success, output: runOutput } = response.data;
      setRunning(false);
      setOutput(runOutput || "Execution finished with no output.");
      socket.emit("runEnd", { roomId, output: runOutput || "Execution finished with no output." });
    } catch (err) {
      setRunning(false);
      const errMsg = err.response?.data?.error || err.message || "An error occurred during execution.";
      setOutput(`Error: ${errMsg}`);
      socket.emit("runEnd", { roomId, output: `Error: ${errMsg}` });
    }
  };

  if (!joined) {
    return (
      <div className="join-container">
        <div className="join-form">
          <h1>Join Code Room</h1>
          <input
            type="text"
            placeholder="Room Id"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <input
            type="text"
            placeholder="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-container">
      <div className="sidebar">
        <div className="room-info">
          <h2>Code Room: {roomId}</h2>
          <button onClick={copyRoomId} className="copy-button">
            Copy Id
          </button>
          {copySuccess && <span className="copy-success">{copySuccess}</span>}
        </div>
        <h3>Users in Room:</h3>
        <ul>
          {users.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
        <p className="typing-indicator">{typing}</p>
        <select
          className="language-selector"
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
        <button className="leave-button" onClick={leaveRoom}>
          Leave Room
        </button>
      </div>

      <div className="editor-wrapper" style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          <Editor
            height={"100%"}
            defaultLanguage={language}
            language={language}
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
        </div>
        
        <div className="io-panel">
          <div className="io-section">
            <label>Input</label>
            <textarea
              className="io-textarea"
              placeholder="Provide input here..."
              value={input}
              onChange={handleInputChange}
            />
          </div>
          <div className="io-section">
            <label>Output</label>
            <pre className="io-output">{output}</pre>
          </div>
          <button className="run-button" onClick={runCode} disabled={running}>
            {running ? "Running..." : "Run"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;