import React, { useRef, useEffect, useState } from "react";
import "./Terminal.css";
import "@xterm/xterm/css/xterm.css";
import { Terminal } from "@xterm/xterm";
import { io } from "socket.io-client";
import { useGlobalContext } from "../../context/globalContext";
const CMD = () => {
  const [error,setError]= useState(null)
  const {currentFile}= useGlobalContext();
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const {socket}= useGlobalContext();
 
  useEffect(() => {
    if(!socket)return;
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      theme: {
        background: "#1e1e1e",
        foreground: "#ffffff",
      },
    });

    term.open(terminalRef.current);

    if(socket)
    {
      term.writeln("✅ Connected to backend");
      term.writeln("Type commands below...");
    }
   

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
  }, [socket]);

  if(error) {
    return <div className="file-explorer-error">{error}</div>;
  }
  return (
    
    <div className="terminal-container">
      <div className="terminal-header">
        <h3>Terminal</h3>
      <button
          onClick={() => {
            if (socket) {
              socket.emit("file:run", currentFile.routeofnode);
            }
            else{
              setError("Socket Error Plz refresh");
            }
          }}
        >
          Run
        </button>
      </div>

      <div className="terminal-content" ref={terminalRef}></div>
    </div>
  );
};

export default CMD;
