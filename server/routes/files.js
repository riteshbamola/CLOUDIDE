const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const router = express.Router();

/**
 * Generate a file tree structure optimized for React-virtualized
 * This format makes it easier to render large file trees efficiently
 */
async function generateFileTree(directory) {
  // Track node IDs for React-virtualized list rendering
  let nodeId = 0;
  
  async function buildTree(currentDir, parentPath = '') {
    const files = await fs.readdir(currentDir);
    // console.log(files);
    const tree = [];

    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const relativePath = parentPath ? path.join(parentPath, file) : file;
      const stat = await fs.stat(filePath);
      
      // Create node with unique ID for virtualized list
      const node = {
        id: nodeId++,
        name: file,
        checked: 0,
        isOpen: false,
        routeofnode: filePath,
        path: relativePath,
        depth: parentPath.split(path.sep).length, // Track nesting level for indentation
        size: stat.size,
        modifiedTime: stat.mtime.getTime()
      };

      if (stat.isDirectory()) {
        node.isDir = true;
        node.children = await buildTree(filePath, relativePath); // Recursively build the tree
        node.childrenCount = node.children.length;
      }
      else {
        node.isDir = false;
        node.childrenCount = 0;
      }

      tree.push(node);
    }

    return tree;
  }

  return {
    id: nodeId++,
    name: 'root',
    checked: 0,
    isOpen: true,
    children: await buildTree(directory),
    routeofnode: '/',
    path: '',
    depth: 0,
    isDir: true,
    childrenCount: (await buildTree(directory)).length
  };
}

/**
 * Get the complete file tree structure
 * This endpoint returns the full tree structure optimized for React-virtualized
 */
router.get('/files', async (req, res) => {
  try {
    const userDirectory = path.join(process.env.INIT_CMD || process.cwd(), 'user');
    const fileTree = await generateFileTree(userDirectory);
    
    // Create a flattened list for virtualized rendering
    const flattenedNodes = [];
    
    function flattenTree(node, isVisible = true) {
      // Add this node to the flattened list
      const nodeInfo = {
        id: node.id,
        name: node.name,
        isDir: node.isDir,
        path: node.path,
        routeofnode: node.routeofnode,
        depth: node.depth,
        isOpen: node.isOpen,
        childrenCount: node.childrenCount,
        isVisible: isVisible
      };
      
      flattenedNodes.push(nodeInfo);
      
      // If this is a directory and it's open, add its children
      if (node.isDir && node.isOpen && node.children) {
        for (const child of node.children) {
          flattenTree(child, isVisible && node.isOpen);
        }
      }
    }
    
    flattenTree(fileTree);
    
    return res.json({ 
      fileTree,
      flattenedNodes
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to generate file tree' });
  }
});

/**
 * Toggle directory open/closed state
 * This endpoint updates the open state of a directory and returns the updated flattened list
 */
router.post('/files/toggle', express.json(), async (req, res) => {
  try {
    const { path: nodePath } = req.body;
    if (!nodePath) {
      return res.status(400).json({ error: 'Node path is required' });
    }
    
    const userDirectory = path.join(process.env.INIT_CMD || process.cwd(), 'user');
    const fileTree = await generateFileTree(userDirectory);
    
    // Find and toggle the specified node
    function toggleNode(node) {
      if (node.routeofnode === nodePath) {
        node.isOpen = !node.isOpen;
        return true;
      }
      
      if (node.isDir && node.children) {
        for (const child of node.children) {
          if (toggleNode(child)) {
            return true;
          }
        }
      }
      
      return false;
    }
    
    toggleNode(fileTree);
    
    // Create updated flattened list
    const flattenedNodes = [];
    function flattenTree(node, isVisible = true) {
      const nodeInfo = {
        id: node.id,
        name: node.name,
        isDir: node.isDir,
        path: node.path,
        routeofnode: node.routeofnode,
        depth: node.depth,
        isOpen: node.isOpen,
        childrenCount: node.childrenCount,
        isVisible: isVisible
      };
      
      flattenedNodes.push(nodeInfo);
      
      if (node.isDir && node.isOpen && node.children) {
        for (const child of node.children) {
          flattenTree(child, isVisible && node.isOpen);
        }
      }
    }
    
    flattenTree(fileTree);
    
    return res.json({ 
      success: true,
      flattenedNodes 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to toggle directory state' });
  }
});


/**
 * Get file content
 * This endpoint returns the content of a file for editing
 */
router.get('/files/content', async (req, res) => {
  try {
    const filePath = req.query.path; // Get the file path from query parameter
    if (typeof filePath !== 'string') {
      return res.status(400).json({ error: 'Invalid path parameter' });
    }

    // Use the absolute path to read the file
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Get file metadata for the editor
    const stats = await fs.stat(filePath);
    const fileInfo = {
      name: path.basename(filePath),
      path: filePath,
      size: stats.size,
      modifiedTime: stats.mtime,
      extension: path.extname(filePath).toLowerCase()
    };
    
    return res.json({ 
      content,
      fileInfo
    });
  } catch (error) {
    console.error('Error reading file:', error);
    return res.status(500).json({ error: 'Error reading file' });
  }
});

/**
 * Get file content for collaboration
 * This endpoint returns the content of a file for collaborative editing
 */
router.get('/collaborate/:id', async (req, res) => {
  try {
    const filePath = req.params.id; // Get the file path from URL parameter
    if (typeof filePath !== 'string') {
      return res.status(400).json({ error: 'Invalid path parameter' });
    }

    // Use the absolute path to read the file
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Get file metadata for the collaborative editor
    const stats = await fs.stat(filePath);
    const fileInfo = {
      name: path.basename(filePath),
      path: filePath,
      size: stats.size,
      modifiedTime: stats.mtime,
      extension: path.extname(filePath).toLowerCase()
    };
    
    return res.json({ 
      content,
      fileInfo
    });
  } catch (error) {
    console.error('Error reading file:', error);
    return res.status(500).json({ error: 'Error reading file' });
  }
});

/**
 * Create a new file or directory
 * This endpoint creates a new file or directory and returns the updated file tree
 */
router.post('/files/create', express.json(), async (req, res) => {
  try {
    const { filePath, content, isDirectory } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    
    const userDirectory = path.join(process.env.INIT_CMD || process.cwd(), 'user');
    const fullPath = path.join(userDirectory, filePath.replace(/^\/+/, ''));
    
    if (isDirectory) {
      await fs.mkdir(fullPath, { recursive: true });
    } else {
      // Ensure parent directory exists
      const parentDir = path.dirname(fullPath);
      await fs.mkdir(parentDir, { recursive: true });
      
      // Create the file with content
      await fs.writeFile(fullPath, content || '');
    }
    
    // Generate updated file tree for React-virtualized
    const fileTree = await generateFileTree(userDirectory);
    
    // Create flattened list for virtualized rendering
    const flattenedNodes = [];
    function flattenTree(node, isVisible = true) {
      const nodeInfo = {
        id: node.id,
        name: node.name,
        isDir: node.isDir,
        path: node.path,
        routeofnode: node.routeofnode,
        depth: node.depth,
        isOpen: node.isOpen,
        childrenCount: node.childrenCount,
        isVisible: isVisible
      };
      
      flattenedNodes.push(nodeInfo);
      
      if (node.isDir && node.isOpen && node.children) {
        for (const child of node.children) {
          flattenTree(child, isVisible && node.isOpen);
        }
      }
    }
    
    flattenTree(fileTree);
    
    return res.json({ 
      success: true, 
      message: isDirectory ? `Directory created: ${filePath}` : `File created: ${filePath}`,
      fileTree,
      flattenedNodes
    });
  } catch (error) {
    console.error('Error creating file/directory:', error);
    return res.status(500).json({ error: 'Failed to create file/directory' });
  }
});

/**
 * Delete a file or directory
 * This endpoint deletes a file or directory and returns the updated file tree
 */
router.delete('/files/delete', express.json(), async (req, res) => {
  try {
    const { path: filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    
    // Check if path exists
    try {
      await fs.access(filePath);
    } catch (err) {
      return res.status(404).json({ error: 'File or directory not found' });
    }
    
    // Check if it's a directory
    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      await fs.rm(filePath, { recursive: true, force: true });
    } else {
      await fs.unlink(filePath);
    }
    
    // Generate updated file tree
    const userDirectory = path.join(process.env.INIT_CMD || process.cwd(), 'user');
    const fileTree = await generateFileTree(userDirectory);
    
    // Create flattened list for virtualized rendering
    const flattenedNodes = [];
    function flattenTree(node, isVisible = true) {
      const nodeInfo = {
        id: node.id,
        name: node.name,
        isDir: node.isDir,
        path: node.path,
        routeofnode: node.routeofnode,
        depth: node.depth,
        isOpen: node.isOpen,
        childrenCount: node.childrenCount,
        isVisible: isVisible
      };
      
      flattenedNodes.push(nodeInfo);
      
      if (node.isDir && node.isOpen && node.children) {
        for (const child of node.children) {
          flattenTree(child, isVisible && node.isOpen);
        }
      }
    }
    
    flattenTree(fileTree);
    
    return res.json({ 
      success: true, 
      message: stats.isDirectory() ? 'Directory deleted' : 'File deleted',
      fileTree,
      flattenedNodes
    });
  } catch (error) {
    console.error('Error deleting file/directory:', error);
    return res.status(500).json({ error: 'Failed to delete file/directory' });
  }
});

module.exports = router;
