import React, { useRef, useEffect } from "react";
import "./Terminal.css";
import "@xterm/xterm/css/xterm.css";
import { Terminal } from "@xterm/xterm";
import { io } from "socket.io-client";

const CMD = () => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);

  useEffect(() => {
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      theme: {
        background: "#1e1e1e",
        foreground: "#ffffff",
      },
    });

    term.open(terminalRef.current);

    // ✅ connect to backend using socket.io
    const socket = io("http://localhost:9000");

    socket.on("connect", () => {
      term.writeln("✅ Connected to backend");
      term.writeln("Type commands below...");
    });

    socket.on("disconnect", () => {
      term.writeln("\r\n❌ Disconnected from server");
    });

    
    socket.on("terminal:data", (data) => {
      term.write(data);
    });

    
    term.onData((data) => {
      socket.emit("input", data);
    });

    xtermRef.current = term;

    return () => {
      term.dispose();
      socket.disconnect();
    };
  }, []);

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <h3>Terminal</h3>
      </div>
      <div className="terminal-content" ref={terminalRef}></div>
    </div>
  );
};

export default CMD;
