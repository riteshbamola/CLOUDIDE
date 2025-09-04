import React from 'react';
import './FileViewer.css';

const FileViewer = ({ file, content, onContentChange }) => {
  // Handle text content change
  const handleContentChange = (e) => {
    onContentChange(e.target.value);
  };

  // Determine if file is an image
  const isImage = (fileName) => {
    if (!fileName) return false;
    const extension = fileName.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension);
  };

  // Determine if file is binary (non-text)
  const isBinary = (fileName) => {
    if (!fileName) return false;
    const extension = fileName.split('.').pop().toLowerCase();
    return ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip', 'exe'].includes(extension);
  };

  // Render appropriate content based on file type
  const renderContent = () => {
    if (!file) {
      return (
        <div className="no-file-selected">
          <p>No file selected</p>
        </div>
      );
    }

    if (file.isDir) {
      return (
        <div className="directory-view">
          <p>Directory: {file.name}</p>
          <p>Path: {file.routeofnode}</p>
          <p>{file.childrenCount} items</p>
        </div>
      );
    }

    if (isImage(file.name)) {
      return (
        <div className="image-view">
          <img src={`/files/content?path=${encodeURIComponent(file.routeofnode)}&raw=true`} alt={file.name} />
        </div>
      );
    }

    if (isBinary(file.name)) {
      return (
        <div className="binary-file-view">
          <p>Binary file cannot be displayed</p>
          <p>File: {file.name}</p>
          <p>Size: {formatFileSize(file.size)}</p>
        </div>
      );
    }

    // Text file - editable
    return (
      <textarea
        className="file-editor"
        value={content}
        onChange={handleContentChange}
        spellCheck="false"
      />
    );
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="file-viewer-container">
      {file && (
        <div className="file-viewer-header">
          <div className="file-info">
            <span className="file-name">{file.name}</span>
            {!file.isDir && (
              <span className="file-path">{file.routeofnode}</span>
            )}
          </div>
        </div>
      )}
      <div className="file-viewer-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default FileViewer;