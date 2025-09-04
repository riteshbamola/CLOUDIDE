import React, { useState, useEffect } from 'react';
import './Layout.css';
import './App.css';
import FileTree from './components/FileTree/FileTree';
import FileViewer from './components/FileViewer/FileViewer';
import Terminal from './components/Terminal/Terminal';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [terminalOutput, setTerminalOutput] = useState([]);

  // Handle file selection
  const handleFileSelect = async (file) => {
    if (!file.isDir) {
      try {
        const response = await fetch(`/content?path=${encodeURIComponent(file.routeofnode)}`);
        const data = await response.json();
        
        setSelectedFile(file);
        setFileContent(data.content);
      } catch (error) {
        console.error('Error fetching file content:', error);
        // Try the alternative endpoint if the first one fails
        try {
          const response = await fetch(`/files/content?path=${encodeURIComponent(file.routeofnode)}`);
          const data = await response.json();
          
          setSelectedFile(file);
          setFileContent(data.content);
        } catch (secondError) {
          console.error('Error fetching file content from alternative endpoint:', secondError);
        }
      }
    } else {
      setSelectedFile(file);
      setFileContent('');
    }
  };

  // Handle file content change
  const handleContentChange = (newContent) => {
    setFileContent(newContent);
  };

  // Handle file save
  const handleSaveFile = async () => {
    if (selectedFile && !selectedFile.isDir) {
      try {
        // Use socket.io to emit file change event
        // This would be implemented with socket.io-client
        console.log('Saving file:', selectedFile.routeofnode);
      } catch (error) {
        console.error('Error saving file:', error);
      }
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Cloud File Explorer</h1>
        <div className="header-actions">
          {selectedFile && !selectedFile.isDir && (
            <button onClick={handleSaveFile}>Save</button>
          )}
        </div>
      </header>
      
      <aside className="sidebar">
        <FileTree onFileSelect={handleFileSelect} />
      </aside>
      
      <main className="main-content">
        <FileViewer 
          file={selectedFile} 
          content={fileContent} 
          onContentChange={handleContentChange} 
        />
      </main>
      
      <footer className="bottom-panel">
        <Terminal output={terminalOutput} />
      </footer>
    </div>
  );
}

export default App;