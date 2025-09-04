import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import './MonacoEditor.css';
import { useTheme } from '../../context/ThemeContext';

const MonacoEditor = ({ files, activeFile, onContentChange, onSave }) => {
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [editorContents, setEditorContents] = useState({});
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const editorRef = useRef(null);
  const { theme } = useTheme();

  // Handle editor mounting
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Add keyboard shortcut for saving (Ctrl+S)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (activeTab) {
        onSave(activeTab.path, editorContents[activeTab.path]);
      }
    });
    
    // Add keyboard shortcut for find (Ctrl+F)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      setShowFindReplace(true);
    });
  };

  // Update open tabs when a new file is selected
  useEffect(() => {
    if (activeFile && !activeFile.isDir) {
      // Check if the file is already open in a tab
      const isFileOpen = openTabs.some(tab => tab.path === activeFile.path);
      
      if (!isFileOpen) {
        // Add the file to open tabs
        setOpenTabs(prevTabs => [...prevTabs, activeFile]);
      }
      
      // Set as active tab
      setActiveTab(activeFile);
    }
  }, [activeFile]);

  // Update editor contents when active tab changes
  useEffect(() => {
    if (activeTab) {
      if (files[activeTab.path]) {
        // If content is already in files object, use it
        setEditorContents(prev => ({
          ...prev,
          [activeTab.path]: files[activeTab.path]
        }));
      } else {
        // Otherwise fetch content from server
        const fetchContent = async () => {
          try {
            const response = await fetch(`/content?path=${encodeURIComponent(activeTab.path)}`);
            const data = await response.json();
            
            setEditorContents(prev => ({
              ...prev,
              [activeTab.path]: data.content
            }));
          } catch (error) {
            console.error('Error fetching file content from /content:', error);
            // Try alternative endpoint
            try {
              const response = await fetch(`/files/content?path=${encodeURIComponent(activeTab.path)}`);
              const data = await response.json();
              
              setEditorContents(prev => ({
                ...prev,
                [activeTab.path]: data.content
              }));
            } catch (secondError) {
              console.error('Error fetching file content from /files/content:', secondError);
            }
          }
        };
        
        fetchContent();
      }
    }
  }, [activeTab, files]);

  // Handle tab click
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Handle tab close
  const handleTabClose = (e, tabToClose) => {
    e.stopPropagation();
    
    // Remove the tab
    setOpenTabs(prevTabs => prevTabs.filter(tab => tab.path !== tabToClose.path));
    
    // If the closed tab was active, set a new active tab
    if (activeTab && activeTab.path === tabToClose.path) {
      const remainingTabs = openTabs.filter(tab => tab.path !== tabToClose.path);
      setActiveTab(remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1] : null);
    }
  };

  // Handle editor content change
  const handleEditorChange = (value) => {
    if (activeTab) {
      setEditorContents(prev => ({
        ...prev,
        [activeTab.path]: value
      }));
      onContentChange(value);
    }
  };

  // Determine language based on file extension
  const getLanguage = (fileName) => {
    if (!fileName) return 'plaintext';
    
    const extension = fileName.split('.').pop().toLowerCase();
    const languageMap = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
      py: 'python',
      java: 'java',
      c: 'c',
      cpp: 'cpp',
      cs: 'csharp',
      go: 'go',
      php: 'php',
      rb: 'ruby',
      rs: 'rust',
      swift: 'swift',
      sh: 'shell',
      sql: 'sql',
      xml: 'xml',
      yaml: 'yaml',
      yml: 'yaml'
    };
    
    return languageMap[extension] || 'plaintext';
  };

  // Handle find in editor
  const handleFind = () => {
    if (!editorRef.current || !findText) return;
    
    const editor = editorRef.current;
    const selection = editor.getSelection();
    const searchStart = selection ? selection.getStartPosition() : { lineNumber: 1, column: 1 };
    
    // Find and select the next occurrence
    const findResults = editor.getModel().findMatches(
      findText,
      searchStart,
      true, // searchOnlyEditableRange
      true, // isRegex
      null, // wordSeparators
      true  // captureMatches
    );
    
    if (findResults.length > 0) {
      editor.setSelection(findResults[0].range);
      editor.revealRangeInCenter(findResults[0].range);
    }
  };
  
  // Handle replace in editor
  const handleReplace = () => {
    if (!editorRef.current || !findText) return;
    
    const editor = editorRef.current;
    const selection = editor.getSelection();
    
    // Only replace if there's a selection that matches the find text
    if (selection && !selection.isEmpty()) {
      const selectedText = editor.getModel().getValueInRange(selection);
      if (selectedText.includes(findText)) {
        editor.executeEdits('replace', [{
          range: selection,
          text: replaceText
        }]);
        
        // Find the next occurrence after replacing
        handleFind();
      }
    } else {
      // If no selection, find first and then replace
      handleFind();
    }
  };
  
  // Handle replace all in editor
  const handleReplaceAll = () => {
    if (!editorRef.current || !findText) return;
    
    const editor = editorRef.current;
    const model = editor.getModel();
    const findResults = model.findMatches(
      findText,
      true, // searchOnlyEditableRange
      true, // isRegex
      null, // wordSeparators
      true  // captureMatches
    );
    
    if (findResults.length > 0) {
      // Sort ranges in reverse order to avoid position shifts during replacement
      findResults.sort((a, b) => {
        if (a.range.startLineNumber !== b.range.startLineNumber) {
          return b.range.startLineNumber - a.range.startLineNumber;
        }
        return b.range.startColumn - a.range.startColumn;
      });
      
      editor.executeEdits('replace-all', findResults.map(match => ({
        range: match.range,
        text: replaceText
      })));
    }
  };

  return (
    <div className={`monaco-editor-container ${theme === 'light' ? 'light-theme' : ''}`}>
      <div className="editor-tabs">
        {openTabs.map(tab => (
          <div 
            key={tab.path} 
            className={`editor-tab ${activeTab && activeTab.path === tab.path ? 'active' : ''}`}
            onClick={() => handleTabClick(tab)}
          >
            <span className="tab-name">{tab.name}</span>
            <button 
              className="tab-close"
              onClick={(e) => handleTabClose(e, tab)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      
      {showFindReplace && (
        <div className="find-replace-container">
          <div className="find-replace-inputs">
            <input
              type="text"
              placeholder="Find"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFind()}
            />
            <input
              type="text"
              placeholder="Replace"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
            />
          </div>
          <div className="find-replace-buttons">
            <button onClick={handleFind}>Find</button>
            <button onClick={handleReplace}>Replace</button>
            <button onClick={handleReplaceAll}>Replace All</button>
            <button onClick={() => setShowFindReplace(false)}>Close</button>
          </div>
        </div>
      )}
      
      <div className="editor-content">
        {activeTab ? (
          <Editor
            height="100%"
            language={getLanguage(activeTab.name)}
            value={editorContents[activeTab.path] || ''}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            options={{
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 2,
            }}
          />
        ) : (
          <div className="no-file-selected">
            <p>No file selected</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonacoEditor;