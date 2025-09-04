import React, { useState, useEffect } from 'react';
import './FileExplorer.css';

const FileExplorer = ({ onFileSelect }) => {
  const [fileTree, setFileTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch file tree data
  useEffect(() => {
    const fetchFileTree = async () => {
      try {
        setLoading(true);
        const response = await fetch('/files');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setFileTree(data.fileTree);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching file tree:', error);
        setError('Failed to load file tree. Please try again.');
        setLoading(false);
      }
    };

    fetchFileTree();
  }, []);

  // Toggle folder expanded/collapsed state
  const toggleFolder = (path) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    setSelectedFile(file.path);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  // Recursive function to render file tree
  const renderTree = (node) => {
    if (!node) return null;

    // For files
    if (!node.isDir) {
      return (
        <li 
          key={node.path} 
          className={`file-item ${selectedFile === node.path ? 'selected' : ''}`}
          onClick={() => handleFileSelect(node)}
        >
          <span className="file-icon">{getFileIcon(node.name)}</span>
          <span className="file-name">{node.name}</span>
        </li>
      );
    }
    
    // For directories
    const isExpanded = expandedFolders[node.path];
    return (
      <li key={node.path} className="folder-item">
        <div 
          className={`folder-header ${isExpanded ? 'expanded' : ''}`}
          onClick={() => toggleFolder(node.path)}
        >
          <span className="folder-icon">{isExpanded ? '📂' : '📁'}</span>
          <span className="folder-name">{node.name}</span>
        </div>
        {isExpanded && node.children && node.children.length > 0 && (
          <ul className="folder-children">
            {node.children.map(child => renderTree(child))}
          </ul>
        )}
      </li>
    );
  };

  // Get appropriate icon for file type
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'js':
      case 'jsx':
        return '📄 JS';
      case 'html':
        return '📄 HTML';
      case 'css':
        return '📄 CSS';
      case 'json':
        return '📄 JSON';
      case 'md':
        return '📄 MD';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return '🖼️';
      default:
        return '📄';
    }
  };

  if (loading) {
    return <div className="file-explorer-loading">Loading...</div>;
  }

  if (error) {
    return <div className="file-explorer-error">{error}</div>;
  }

  return (
    <div className="file-explorer">
      <div className="file-explorer-header">
        <h3>Files</h3>
      </div>
      <div className="file-explorer-content">
        {fileTree ? (
          <ul className="file-tree">
            {renderTree(fileTree)}
          </ul>
        ) : (
          <div className="empty-tree">No files found</div>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;