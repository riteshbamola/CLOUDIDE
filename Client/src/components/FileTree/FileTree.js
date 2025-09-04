import React, { useState, useEffect } from 'react';
import { List, AutoSizer } from 'react-virtualized';
import './FileTree.css';

const FileTree = ({ onFileSelect }) => {
  const [treeData, setTreeData] = useState(null);
  const [flattenedNodes, setFlattenedNodes] = useState([]);
  const [visibleNodes, setVisibleNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setTreeData(data.fileTree);
        setFlattenedNodes(data.flattenedNodes);
        setVisibleNodes(data.flattenedNodes.filter(node => node.isVisible));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching file tree:', error);
        setError('Failed to load file tree. Please try again.');
        setLoading(false);
      }
    };

    fetchFileTree();
  }, []);

  // Toggle directory open/closed
  const toggleDirectory = async (node) => {
    if (!node.isDir) return;

    try {
      const response = await fetch('/files/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: node.routeofnode }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setFlattenedNodes(data.flattenedNodes);
      setVisibleNodes(data.flattenedNodes.filter(node => node.isVisible));
    } catch (error) {
      console.error('Error toggling directory:', error);
      setError('Failed to toggle directory. Please try again.');
    }
  };

  // Handle node click
  const handleNodeClick = (node) => {
    if (node.isDir) {
      toggleDirectory(node);
    }
    onFileSelect(node);
  };

  // Render a row in the virtualized list
  const rowRenderer = ({ index, key, style }) => {
    const node = visibleNodes[index];
    if (!node) return null;

    const indentation = node.depth * 20; // 20px per level of depth
    const nodeIcon = node.isDir 
      ? (node.isOpen ? '📂' : '📁') 
      : getFileIcon(node.name);

    return (
      <div
        key={key}
        style={style}
        className="file-tree-node"
        onClick={() => handleNodeClick(node)}
      >
        <div style={{ paddingLeft: `${indentation}px` }} className="file-tree-node-content">
          <span className="file-icon">{nodeIcon}</span>
          <span className="file-name">{node.name}</span>
        </div>
      </div>
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
    return (
      <div className="file-tree-container loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="file-tree-container error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="file-tree-container">
      <div className="file-tree-header">
        <h3>Files</h3>
      </div>
      <div className="file-tree-content">
        {visibleNodes.length > 0 ? (
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                width={width}
                rowCount={visibleNodes.length}
                rowHeight={24}
                rowRenderer={rowRenderer}
                overscanRowCount={10}
              />
            )}
          </AutoSizer>
        ) : (
          <div className="empty-tree">
            <p>No files found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileTree;