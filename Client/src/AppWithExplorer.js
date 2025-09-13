import React, { useState, useEffect } from "react";
import "./Layout.css";
import "./App.css";
import { FileExplorer, MonacoEditor, ThemeToggle } from "./components";
import CMD from "./components/Terminal/Terminal";
import Room from "./components/Room/Room"; 
import { ThemeProvider } from "./context/ThemeContext";
import { useGlobalContext } from "./context/globalContext";
import { LiveblocksProvider } from "@liveblocks/react";

function AppWithExplorer() {
  const {
    currentFile,
    setCurrentFile,
    fileContent,
    setFileContent,
    terminalOutput,
    setTerminalOutput,
    roomID,
    setRoomID,
    roomFile,
    roomFileContent,
    setRoomFileContent,
    setroomFile
  } = useGlobalContext();
  const [openFiles, setOpenFiles] = useState({});
  const [showRoom, setShowRoom] = useState(false);
  

  // Handle file selection
  const handleFileSelect = async (file) => {
    if (!file.isDir) {
      try {
        const response = await fetch(`/files/content?path=${encodeURIComponent(file.path)}`);
        const data = await response.json();

        setCurrentFile(file);
        setFileContent(data.content);

        setOpenFiles((prev) => ({
          ...prev,
          [file.path]: data.content,
        }));
      } catch (error) {
        console.error("Error fetching file content:", error);
        setTerminalOutput((prev) => prev + "\nError fetching file: " + error.message);
      }
    } else {
      setCurrentFile(file);
      setFileContent("");
    }
  };

  const handleRoomFileSelect = async (file)=>{
     if (!file.isDir) {
      try {
        const response = await fetch(`/files/content?path=${encodeURIComponent(file.path)}`);
        const data = await response.json();

        setroomFile(file);
        setRoomFileContent(data.content);
        console.log(roomFile);
        console.log(roomFileContent);
      }catch(error){
        console.error("Error fetching file content:", error);
        setTerminalOutput((prev) => prev + "\nError fetching file: " + error.message);
      }
    
}
}
  // Handle content change
  const handleContentChange = (newContent) => {
    setFileContent(newContent);
  };

  // Handle file save
  const handleSaveFile = async (path, content) => {
    const fileToSave = path ? { path } : currentFile;
    const contentToSave = content !== undefined ? content : fileContent;

    if (fileToSave && !fileToSave.isDir) {
      try {
        const response = await fetch("/files/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: fileToSave.path,
            content: contentToSave,
            isDir: false,
          }),
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const fileName = fileToSave.name || fileToSave.path.split("/").pop();
        setTerminalOutput((prev) => prev + "\nFile saved successfully: " + fileName);

        if (path) {
          setOpenFiles((prev) => ({
            ...prev,
            [path]: content,
          }));
        }
      } catch (error) {
        console.error("Error saving file:", error);
        setTerminalOutput((prev) => prev + "\nError saving file: " + error.message);
      }
    }
  };

  const handleJoinRoom = () => {
    setShowRoom(true);
    setTerminalOutput((prev) => prev + "\nNavigating to Room...");
  };

  const handleBackToExplorer = () => {
    setShowRoom(false);
    setTerminalOutput((prev) => prev + "\nReturned to File Explorer");
  };

  // Render Room with Liveblocks
  if (showRoom) {
    return (
      <LiveblocksProvider publicApiKey="pk_dev_6CYB3OfiiGDk5QVpj43YYi86CNAJI8ctcdTJwimk5ZbVk7rAsqW1S9v56MYGHHII">
        <div className="app-container room-view">
          <header className="header">
            <button
              className="back-button"
              onClick={handleBackToExplorer}
              title="Back to File Explorer"
            >
              ← Back
            </button>
            <h1>Collaborative Room</h1>
          </header>
          <div className="room-main">
           <Room 
              handleRoomFile={handleRoomFileSelect} 
              onRoomJoined={(id) => {
                setRoomID(id);
                setTerminalOutput(prev => prev + `\nJoined room: ${id}`);
                setShowRoom(false);  // ✅ Exit the "room create/join" screen
              }} 
/>
          </div>
        </div>
      </LiveblocksProvider>
    );
  }


  if(roomID){
    return (
    <ThemeProvider>
      <div className="app-container">
        <header className="header">
          <h1>Cloud File Explorer</h1>
          <div className="header-actions">
            <button
              className="join-room-button"
              onClick={handleJoinRoom}
              title="Join a collaborative room"
            >
              🚪 Join Room
            </button>
            <ThemeToggle />
            {currentFile && !currentFile.isDir && (
              <button onClick={() => handleSaveFile()}>Save</button>
            )}
          </div>
        </header>

        {/* <aside className="sidebar">
          <FileExplorer onFileSelect={handleFileSelect} />
        // </aside> */}

        <main className="main-content">
          <MonacoEditor
            files={openFiles}
            onContentChange={handleContentChange}
            onSave={handleSaveFile}
            onFileSelect={handleFileSelect}
          />
        </main>

        <footer className="bottom-panel">
          <CMD output={terminalOutput} />
        </footer>
      </div>
    </ThemeProvider>
    );
  }
  // Default view
  return (
    <ThemeProvider>
      <div className="app-container">
        <header className="header">
          <h1>Cloud File Explorer</h1>
          <div className="header-actions">
            <button
              className="join-room-button"
              onClick={handleJoinRoom}
              title="Join a collaborative room"
            >
              🚪 Join Room
            </button>
            <ThemeToggle />
            {currentFile && !currentFile.isDir && (
              <button onClick={() => handleSaveFile()}>Save</button>
            )}
          </div>
        </header>

        <aside className="sidebar">
          <FileExplorer onFileSelect={handleFileSelect} />
        </aside>

        <main className="main-content">
          <MonacoEditor
            files={openFiles}
            onContentChange={handleContentChange}
            onSave={handleSaveFile}
            onFileSelect={handleFileSelect}
          />
        </main>

        <footer className="bottom-panel">
          <CMD output={terminalOutput} />
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default AppWithExplorer;
