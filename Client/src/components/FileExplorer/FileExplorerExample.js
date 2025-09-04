import React, { useState } from 'react';
import FileExplorer from './FileExplorer';

const FileExplorerExample = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    console.log('Selected file:', file);
    // Here you would typically fetch the file content
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '300px', borderRight: '1px solid #ddd' }}>
        <FileExplorer onFileSelect={handleFileSelect} />
      </div>
      <div style={{ flex: 1, padding: '20px' }}>
        {selectedFile ? (
          <div>
            <h2>Selected File</h2>
            <p><strong>Name:</strong> {selectedFile.name}</p>
            <p><strong>Path:</strong> {selectedFile.path}</p>
            <p><strong>Type:</strong> {selectedFile.isDir ? 'Directory' : 'File'}</p>
          </div>
        ) : (
          <p>Select a file from the explorer</p>
        )}
      </div>
    </div>
  );
};

export default FileExplorerExample;