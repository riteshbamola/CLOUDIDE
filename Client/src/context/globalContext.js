import React, { createContext, useContext, useReducer, useRef, useEffect, Children, useState } from "react";
import { io } from "socket.io-client";

const GlobalContext = createContext(); 

export const GlobalProvider =({children})=>{

    const [socket,setSocket]= useState();
    const [currentFile,setCurrentFile]=useState("");
    const [fileTree, setFileTree] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [terminalOutput, setTerminalOutput] = useState('');
    const [flattenedNodes, setFlattenedNodes] = useState([]);
    const [error,setError]= useState(null);
    const [roomID,setRoomID]= useState("");
    const [roomFile,setroomFile]= useState(null);
    const [roomFileContent,setRoomFileContent]= useState(null);
    const [roomPassword, setRoomPassword] = useState("");

    useEffect(() => {
    const s = io("http://localhost:9000");
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);
    return (
        <GlobalContext.Provider value={{
            socket,
            currentFile,
            setCurrentFile,
            fileTree,
            setFileTree,
            fileContent,
            setFileContent,
            terminalOutput,
            setTerminalOutput,
            flattenedNodes,
            setFlattenedNodes,
            roomID,
            setRoomID,
            roomFile,
            setroomFile,
            roomPassword,
            setRoomPassword,
            roomFileContent,
            setRoomFileContent
        
        }}>
            {children}
        </GlobalContext.Provider>
    );
}
export const useGlobalContext = () => {
  return useContext(GlobalContext);
};