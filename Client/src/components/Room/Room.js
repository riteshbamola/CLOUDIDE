import React, { useState } from "react";
import { RoomProvider } from "@liveblocks/react";
import FileExplorer from "../FileExplorer/FileExplorer";
import "./Room.css";

const Room = () => {
  const [activeTab, setActiveTab] = useState("create"); // "create" or "join"
  const [roomId, setRoomId] = useState("");
  const [roomPassword, setRoomPassword] = useState("");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleJoinRoom = () => {
    if (!roomId) return alert("Enter Room ID");
    // Password can be used for verification if needed
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
        {activeTab === "create" && (
          <RoomProvider id={roomId || "new-room"}>
            <div className="password-box">
              <input
                type="text"
                className="password-input"
                placeholder="Enter Room ID (optional)"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
            </div>

            <div className="file-explorer-box">
              <FileExplorer />
            </div>
          </RoomProvider>
        )}

        {/* Join Room */}
        {activeTab === "join" && (
          <RoomProvider id={roomId || "join-room"}>
            <div className="password-box">
              <input
                type="text"
                className="password-input"
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
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
