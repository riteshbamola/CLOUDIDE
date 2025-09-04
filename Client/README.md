# Cloud IDE Frontend

This is a React-based frontend for the Cloud IDE application. It provides a responsive user interface with a file tree, file viewer, and terminal output panel.

## Features

- Responsive layout using CSS Grid
- File tree navigation with react-virtualized for performance
- File content viewing and editing
- Terminal output display
- Real-time updates via API integration

## Project Structure

```
Client/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── FileTree/
│   │   │   ├── FileTree.js
│   │   │   └── FileTree.css
│   │   ├── FileViewer/
│   │   │   ├── FileViewer.js
│   │   │   └── FileViewer.css
│   │   ├── Terminal/
│   │   │   ├── Terminal.js
│   │   │   └── Terminal.css
│   │   └── index.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   ├── index.css
│   ├── Layout.css
│   └── reportWebVitals.js
└── package.json
```

## Layout

The application uses a responsive CSS Grid layout with:
- Header at the top
- Sidebar on the left (300px width)
- Main content area in the center
- Bottom panel (200px height)

The layout is responsive and adjusts for smaller screens.

## Components

### FileTree

A virtualized tree component that efficiently renders large file structures. Uses react-virtualized for performance optimization.

### FileViewer

Displays and allows editing of file content. Supports different file types including text files and images.

### Terminal

Displays terminal output from the server.

## API Integration

The frontend connects to the backend API endpoints for:
- Fetching the file tree structure
- Toggling directories open/closed
- Getting file content
- Saving file changes
- Creating new files and directories
- Deleting files and directories

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Build for production:
   ```
   npm run build
   ```

The application will proxy API requests to the backend server running on the default port.