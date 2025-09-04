/**
 * API service for interacting with the backend
 */

const API = {
  // Get file tree
  getFileTree: async () => {
    try {
      const response = await fetch('/files');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching file tree:', error);
      throw error;
    }
  },

  // Toggle directory open/closed
  toggleDirectory: async (path) => {
    try {
      const response = await fetch('/files/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error toggling directory:', error);
      throw error;
    }
  },

  // Get file content
  getFileContent: async (path) => {
    try {
      const response = await fetch(`/files/content?path=${encodeURIComponent(path)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching file content:', error);
      throw error;
    }
  },

  // Save file content
  saveFileContent: async (path, content) => {
    try {
      const response = await fetch('/files/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path, content, isDir: false }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error saving file content:', error);
      throw error;
    }
  },

  // Create new file or directory
  createFileOrDirectory: async (path, isDir, content = '') => {
    try {
      const response = await fetch('/files/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path, content, isDir }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating file or directory:', error);
      throw error;
    }
  },

  // Delete file or directory
  deleteFileOrDirectory: async (path) => {
    try {
      const response = await fetch('/files/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting file or directory:', error);
      throw error;
    }
  },
};

export default API;