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

const io = new SocketServer(server, {
  cors: { origin: "*" },
});
app.use(cors());


io.on('connection',(socket)=>{
  console.log(socket.id);
  socket.on('terminal:data', (data)=>{
    mockTerminal.write(data);
  });
  socket.on('file:run',(filePath)=>{
    let command;
    try{
      //  const fullpath=filePath.startsWith('user') ? filePath:path.join(filePath,'user');
      const fullpath= filePath
      const ext= path.extname(fullpath).toLowerCase();
      console.log(ext);
      const filename= path.basename(fullpath);
      
       switch (ext) {
      case '.js':
        command = `node "${filename}"`;
        break;

      case '.py':
        command = `python "${filename}"`;
        break;

      case '.java':
       
        command = `javac "${filename}" && java "${path.parse(filename).name}"`;
        break;

      case '.c':
        
        command = `gcc "${filename}" -o "${path.parse(filename).name}" && "${path.parse(filename).name}"`;
        break;

      case '.cpp':
        
        command = `g++ "${filename}" -o "${path.parse(filename).name}" && "${path.parse(filename).name}"`;
        break;

      case '.sh':
        command = `bash "${filename}"`;
        break;

      default:
        return socket.emit('terminal:data', `> Cannot run files with extension: ${ext}\n`);
    }
    }
    catch(error)
    {
      console.log(error.message);
    }
    socket.emit('terminal:data', `> Running: ${command}\n`);
    socket.emit('terminal:data',`hello`);
  })
})

const userDirectory = path.join(process.env.INIT_CMD || process.cwd(), 'user');

// Ensure user directory exists
fs.mkdir(userDirectory, { recursive: true })
  .then(() => console.log(`User directory created/verified at: ${userDirectory}`))
  .catch(err => console.error(`Error creating user directory: ${err.message}`));

// Mock terminal process since node-pty is removed
  const mockTerminal = {
    write: (data) => {
      io.emit('terminal:data', `> ${data}\r\n`);
      console.log(data);
    },
    onData: (callback) => {
      // Initial terminal message
      setTimeout(() => {
        callback('Terminal emulation active (node-pty removed)\r\n$ ');
      }, 100);
    }
  };




chokidar.watch(userDirectory).on('all', (event, path) => {
  io.emit('file:refresh', path);
  console.log(`File event: ${event} on path: ${path}`);
});

// Setup mock terminal
mockTerminal.onData((data) => {
  io.emit('terminal:data', data);
});

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
