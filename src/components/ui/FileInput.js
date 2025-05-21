'use client';

import { useRef } from 'react';

/**
 * Hidden file input component for importing chat JSON files
 * Can be used in both desktop mode and inside burger menu
 */
export default function FileInput({ onFileSelect, isBurgerMenu = false }) {
  const fileInputRef = useRef(null);
  
  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/json') {
      onFileSelect(file);
    } else {
      alert('Please select a valid JSON file');
    }
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };
  
  // If in burger menu, we only need the file input itself
  if (isBurgerMenu) {
    return (
      <div className="file-input-container">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleChange}
          accept=".json,application/json"
        />
      </div>
    );
  }
  
  // Regular button version for desktop
  return (
    <>
      <button 
        onClick={handleClick}
        className="chat-action-btn"
        title="Import chat from JSON file"
      >
        📥 Import
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept=".json,application/json"
        style={{ display: 'none' }}
      />
    </>
  );
}
