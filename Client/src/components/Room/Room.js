import React, { useState } from "react";
import { RoomProvider } from "@liveblocks/react";
import FileExplorer from "../FileExplorer/FileExplorer";
import "./Room.css";
import { useGlobalContext } from "../../context/globalContext";


const Room = ({handleRoomFile,onRoomJoined}) => {
  const [activeTab, setActiveTab] = useState("create"); // "create" or "join"
  const {roomID,setRoomID,
    roomPassword,setRoomPassword,
      }= useGlobalContext();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  

   const handleJoinRoom = () => {
    if (!roomID) return alert("Enter Room ID");
    console.log("Joined room:", roomID);
    if (onRoomJoined) onRoomJoined(roomID);  // ✅ notify parent
  };

  const handleCreateRoom = () => {
    const newRoom = "123456";
    setRoomID(newRoom);
    console.log("Created room:", newRoom);
    if (onRoomJoined) onRoomJoined(newRoom); // ✅ notify parent
  };

  return (
    <div className="room-wrapper">
      <div className="room-card">
        <h1 className="room-title">Collaborative Room</h1>

        {/* Tabs */}
        <div className="tab-buttons">
          <button
            onClick={() => handleTabChange("create")}
            className={activeTab === "create" ? "tab-active" : ""}
          >
            Create Room
          </button>
          <button
            onClick={() => handleTabChange("join")}
            className={activeTab === "join" ? "tab-active" : ""}
          >
            Join Room
          </button>
        </div>

        {/* Create Room */}
        {(activeTab === "create") && (
          <RoomProvider id={roomID || "new-room"}>
            <div className="password-box">
              <input
                type="text"
                className="password-input"
                placeholder="Enter Room ID (optional)"
                value={roomID}
                onChange={(e) => setRoomID(e.target.value)}
              />
            </div>

            <div className="file-explorer-box">
              <FileExplorer onFileSelect= {handleRoomFile}/>
            </div>
            <button className="primary-btn" onClick={()=>{
              setRoomID("1234");
              onRoomJoined("1234");
            }}>
                Create
              </button>
          </RoomProvider>
        )}

        {/* Join Room */}
        {activeTab === "join" && (
          <RoomProvider id={roomID || "join-room"}>
            <div className="password-box">
              <input
                type="text"
                className="password-input"
                placeholder="Enter Room ID"
                value={roomID}
                onChange={(e) => setRoomID(e.target.value)}
              />
              <input
                type="password"
                className="password-input"
                placeholder="Enter Room Password"
                value={roomPassword}
                onChange={(e) => setRoomPassword(e.target.value)}
              />
              <button className="primary-btn" onClick={handleJoinRoom}>
                Join
              </button>
            </div>
          </RoomProvider>
        )}
      </div>
    </div>
  );
};

export default Room;
