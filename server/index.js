const http = require('http');
const fs = require('fs').promises;
const os = require('os');
const express = require('express');
const { Server: SocketServer } = require('socket.io');
const path = require('path');
const fileRoutes = require('./routes/files')
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const chokidar = require('chokidar');
const { fstat } = require('fs');



const userDirectory = path.join(process.env.INIT_CMD || process.cwd(), 'user');

// Ensure user directory exists
fs.mkdir(userDirectory, { recursive: true })
  .then(() => console.log(`User directory created/verified at: ${userDirectory}`))
  .catch(err => console.error(`Error creating user directory: ${err.message}`));

// Mock terminal process since node-pty is removed
  const mockTerminal = {
    write: (data) => {
      // Echo back the input with a prefix
      io.emit('terminal:data', `> ${data}\r\n`);
    },
    onData: (callback) => {
      // Initial terminal message
      setTimeout(() => {
        callback('Terminal emulation active (node-pty removed)\r\n$ ');
      }, 100);
    }
  };

const io = new SocketServer(server, {
  cors: { origin: "*" },
});

app.use(cors());
io.attach(server);

chokidar.watch(userDirectory).on('all', (event, path) => {
  io.emit('file:refresh', path);
  console.log(`File event: ${event} on path: ${path}`);
});

// Setup mock terminal
mockTerminal.onData((data) => {
  io.emit('terminal:data', data);
});

io.on('connection', (socket) => {
  console.log(`Socket Connected ${socket.id}`);
  socket.on('terminal:write', (data) => {
    mockTerminal.write(data);
  });
  socket.on('file:change', async ({ path: filePath, content }) => {
    console.log(`File change requested for: ${filePath}`);
    try {
      // Ensure parent directories exist
      const fullPath = filePath.startsWith(userDirectory) ? filePath : path.join(userDirectory, filePath);
      const parentDir = path.dirname(fullPath);
      await fs.mkdir(parentDir, { recursive: true });
      
      // Write the file content
      await fs.writeFile(fullPath, content);
      console.log(`File successfully written to: ${fullPath}`);
      
      // Emit an event to refresh the file tree
      socket.broadcast.emit('file:refresh', filePath);
    } catch (error) {
      console.error(`Error writing to file ${filePath}:`, error);
    }
  });
  
  // Handle file execution
  socket.on('file:run', async ({ path: filePath }) => {
    console.log(`File execution requested for: ${filePath}`);
    try {
      const fullPath = filePath.startsWith(userDirectory) ? filePath : path.join(userDirectory, filePath);
      const extension = path.extname(fullPath).toLowerCase();
      
      // Send message to terminal that file is running
      io.emit('terminal:data', `\r\n> Running file: ${path.basename(fullPath)}\r\n`);
      
      // Execute different file types
      switch (extension) {
        case '.js':
          io.emit('terminal:data', `$ node ${path.basename(fullPath)}\r\n`);
          try {
            const fileContent = await fs.readFile(fullPath, 'utf-8');
            // Simple output simulation for JavaScript files
            io.emit('terminal:data', `Output from ${path.basename(fullPath)}:\r\n`);
            io.emit('terminal:data', `${fileContent.includes('console.log') ? 'Console output would appear here' : 'No console output'}\r\n`);
          } catch (err) {
            io.emit('terminal:data', `Error: ${err.message}\r\n`);
          }
          break;
        case '.py':
          io.emit('terminal:data', `$ python ${path.basename(fullPath)}\r\n`);
          try {
            const fileContent = await fs.readFile(fullPath, 'utf-8');
            // Simple output simulation for Python files
            io.emit('terminal:data', `Output from ${path.basename(fullPath)}:\r\n`);
            io.emit('terminal:data', `${fileContent.includes('print') ? 'Print output would appear here' : 'No print output'}\r\n`);
          } catch (err) {
            io.emit('terminal:data', `Error: ${err.message}\r\n`);
          }
          break;
        case '.html':
          io.emit('terminal:data', `$ Opening ${path.basename(fullPath)} in browser\r\n`);
          io.emit('terminal:data', `HTML files can be previewed in a browser\r\n`);
          break;
        default:
          io.emit('terminal:data', `Unsupported file type: ${extension}\r\n`);
          io.emit('terminal:data', `Currently supporting: .js, .py, .html\r\n`);
      }
      
      // Complete execution
      io.emit('terminal:data', `\r\n$ `);
    } catch (error) {
      console.error(`Error executing file ${filePath}:`, error);
      io.emit('terminal:data', `Error: ${error.message}\r\n$ `);
    }
  });
});
// Add content endpoint
app.get('/content', async (req, res) => {
  try {
    const filePath = req.query.path; // Get the file path from query parameter
    if (typeof filePath !== 'string') {
      return res.status(400).json({ error: 'Invalid path parameter' });
    }

    // Check if raw parameter is present for binary files like images
    const isRaw = req.query.raw === 'true';

    // Use the absolute path to read the file
    if (isRaw) {
      // For binary files, send the raw file
      return res.sendFile(filePath);
    } else {
      // For text files, read the content and send as JSON
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Get file metadata for the editor
      const stat = await fs.stat(filePath);
      
      return res.json({
        content,
        size: stat.size,
        modifiedTime: stat.mtime.getTime()
      });
    }
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
    return res.status(500).json({ error: 'Failed to read file' });
  }
});

app.use('/', fileRoutes);

const PORT = 9000;
server.listen(PORT, '0.0.0.0', () => console.log(`🐋 Docker server running on port ${PORT}`));
