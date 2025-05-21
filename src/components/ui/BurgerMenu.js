'use client';

import { useState, useRef, useEffect } from 'react';
import FileInput from './FileInput';

/**
 * Burger menu component for mobile-friendly UI
 */
export default function BurgerMenu({ onExport, onImport, onClear, isImporting }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  // Handle click outside to close menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="burger-menu-container" ref={menuRef}>
      <button 
        onClick={toggleMenu}
        className="burger-menu-btn"
        aria-label="Menu"
        title="Open menu"
      >
        <div className={`burger-icon ${isOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      
      {isOpen && (
        <div className="burger-menu-dropdown">
          <div className="menu-item" onClick={() => { onExport(); setIsOpen(false); }}>
            <span className="menu-item-icon">📤</span>
            <span className="menu-item-text">Export Chat</span>
            <small className="menu-item-desc">Save conversation as JSON</small>
          </div>
          
          <div className="menu-item">
            <span className="menu-item-icon">📥</span>
            <span className="menu-item-text">Import Chat</span>
            <small className="menu-item-desc">Load saved conversation</small>
            <FileInput 
              onFileSelect={(file) => { 
                onImport(file); 
                setIsOpen(false); 
              }}
              isBurgerMenu={true}
            />
          </div>
          
          <div 
            className={`menu-item ${isImporting ? 'disabled' : ''}`} 
            onClick={() => {
              if (!isImporting) {
                onClear();
                setIsOpen(false);
              }
            }}
          >
            <span className="menu-item-icon">🗑️</span>
            <span className="menu-item-text">Clear Chat</span>
            <small className="menu-item-desc">Delete all messages</small>
          </div>
        </div>
      )}
    </div>
  );
}
