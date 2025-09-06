import React, { useState, useEffect } from 'react';
import './Layout.css';
import './App.css';
import { FileExplorer, MonacoEditor, ThemeToggle } from './components';
import CMD from './components/Terminal/Terminal';
import { ThemeProvider } from './context/ThemeContext';

function AppWithExplorer() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [terminalOutput, setTerminalOutput] = useState('');
  const [openFiles, setOpenFiles] = useState({});

  // Handle file selection
  const handleFileSelect = async (file) => {
    if (!file.isDir) {
      try {
        const response = await fetch(`/files/content?path=${encodeURIComponent(file.path)}`);
        const data = await response.json();
        
        setSelectedFile(file);
        setFileContent(data.content);
        
        // Add to open files
        setOpenFiles(prev => ({
          ...prev,
          [file.path]: data.content
        }));
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
  const handleSaveFile = async (path, content) => {
    const fileToSave = path ? { path } : selectedFile;
    const contentToSave = content !== undefined ? content : fileContent;
    
    if (fileToSave && !fileToSave.isDir) {
      try {
        const response = await fetch('/files/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: fileToSave.path,
            content: contentToSave,
            isDir: false
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const fileName = fileToSave.name || fileToSave.path.split('/').pop();
        setTerminalOutput(prev => prev + '\nFile saved successfully: ' + fileName);
        
        // Update open files state
        if (path) {
          setOpenFiles(prev => ({
            ...prev,
            [path]: content
          }));
        }
      } catch (error) {
        console.error('Error saving file:', error);
        setTerminalOutput(prev => prev + '\nError saving file: ' + error.message);
      }
    }
  };

  return (
    <ThemeProvider>
      <div className="app-container">
        <header className="header">
          <h1>Cloud File Explorer</h1>
          <div className="header-actions">
            <ThemeToggle />
            {selectedFile && !selectedFile.isDir && (
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
            activeFile={selectedFile}
            onContentChange={handleContentChange}
            onSave={handleSaveFile}
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