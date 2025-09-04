import React, { useState, useEffect } from 'react';
import './Layout.css';
import './App.css';
import { FileExplorer } from './components';
import FileViewer from './components/FileViewer/FileViewer';
import Terminal from './components/Terminal/Terminal';

function AppWithExplorer() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [terminalOutput, setTerminalOutput] = useState('');

  // Handle file selection
  const handleFileSelect = async (file) => {
    if (!file.isDir) {
      try {
        const response = await fetch(`/files/content?path=${encodeURIComponent(file.path)}`);
        const data = await response.json();
        
        setSelectedFile(file);
        setFileContent(data.content);
      } catch (error) {
        console.error('Error fetching file content:', error);
        // Add error to terminal output
        setTerminalOutput(prev => prev + '\nError fetching file: ' + error.message);
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
        const response = await fetch('/files/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: selectedFile.path,
            content: fileContent,
            isDir: false
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        setTerminalOutput(prev => prev + '\nFile saved successfully: ' + selectedFile.name);
      } catch (error) {
        console.error('Error saving file:', error);
        setTerminalOutput(prev => prev + '\nError saving file: ' + error.message);
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
        <FileExplorer onFileSelect={handleFileSelect} />
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

export default AppWithExplorer;