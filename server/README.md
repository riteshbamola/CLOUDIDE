# Cloud Server with React-Virtualized File Tree

This server provides a backend for a file explorer application with APIs optimized for React-virtualized rendering on the client side.

## File Tree API

The file tree API has been optimized to work with React-virtualized for efficient rendering of large file trees.

### Key Features

- **Unique IDs**: Each node has a unique ID for efficient list rendering
- **Flattened Structure**: The API provides both a hierarchical tree and a flattened list for virtualized rendering
- **Depth Information**: Each node includes depth information for proper indentation
- **Visibility Tracking**: Nodes track their visibility state based on parent open/closed state
- **Metadata**: File size, modification time, and other metadata are included

## API Endpoints

### GET /files

Returns the complete file tree structure optimized for React-virtualized, including:
- Full hierarchical tree structure
- Flattened list of nodes for virtualized rendering

### POST /files/toggle

Toggles a directory's open/closed state and returns the updated flattened list.

**Request Body:**
```json
{
  "path": "absolute/path/to/directory"
}
```

### GET /files/content

Returns the content of a file along with its metadata.

**Query Parameters:**
- `path`: Absolute path to the file

### GET /collaborate/:id

Returns the content of a file for collaborative editing.

**URL Parameters:**
- `id`: Absolute path to the file

### POST /files/create

Creates a new file or directory and returns the updated file tree.

**Request Body:**
```json
{
  "filePath": "relative/path/to/file",
  "content": "file content",
  "isDirectory": false
}
```

### DELETE /files/delete

Deletes a file or directory and returns the updated file tree.

**Request Body:**
```json
{
  "path": "absolute/path/to/file"
}
```

## Client-Side Implementation

On the client side, you can use React-virtualized to render the file tree efficiently. Here's a basic example:

```jsx
import React, { useState, useEffect } from 'react';
import { List, AutoSizer } from 'react-virtualized';

function FileTree() {
  const [nodes, setNodes] = useState([]);
  
  useEffect(() => {
    // Fetch the file tree
    fetch('/files')
      .then(res => res.json())
      .then(data => setNodes(data.flattenedNodes.filter(node => node.isVisible)));
  }, []);
  
  const toggleDirectory = (path) => {
    fetch('/files/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path })
    })
      .then(res => res.json())
      .then(data => setNodes(data.flattenedNodes.filter(node => node.isVisible)));
  };
  
  const renderRow = ({ index, key, style }) => {
    const node = nodes[index];
    return (
      <div key={key} style={style}>
        <div style={{ paddingLeft: node.depth * 20 }}>
          {node.isDir ? (
            <span onClick={() => toggleDirectory(node.routeofnode)}>
              {node.isOpen ? '📂' : '📁'} {node.name}
            </span>
          ) : (
            <span>📄 {node.name}</span>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div style={{ height: '100vh' }}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            rowCount={nodes.length}
            rowHeight={24}
            rowRenderer={renderRow}
          />
        )}
      </AutoSizer>
    </div>
  );
}

export default FileTree;
```

## Installation

1. Install dependencies: `npm install`
2. Start the server: `npm run dev`

The server will start on the default port (usually 3000) and will watch for file changes in the user directory.