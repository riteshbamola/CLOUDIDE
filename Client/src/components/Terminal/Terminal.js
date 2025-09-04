import React, { useRef, useEffect } from 'react';
import './Terminal.css';

const Terminal = ({ output }) => {
  const terminalRef = useRef(null);

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <h3>Terminal</h3>
      </div>
      <div className="terminal-content" ref={terminalRef}>
        {output.length > 0 ? (
          <pre>{output}</pre>
        ) : (
          <div className="terminal-placeholder">
            <p>Terminal output will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Terminal;