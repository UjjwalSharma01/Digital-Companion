'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ChatSidebar({ conversations, activeConversation, setActiveConversation }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Format date to readable format
  const formatDate = (date) => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      return 'Today';
    } else if (isYesterday) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleNewChat = () => {
    // This will be replaced with actual Firebase logic
    setIsCreatingNew(true);
    // Mock creating a new conversation
    const newId = `conv-${Date.now()}`;
    const newConversation = {
      id: newId,
      title: 'New Conversation',
      createdAt: new Date()
    };
    
    // Add to conversations list (in a real app, you'd update the state here)
    setActiveConversation(newId);
    setIsCreatingNew(false);
    setIsMobileSidebarOpen(false); // Close mobile sidebar after action
  };

  // Group conversations by date
  const groupedConversations = conversations.reduce((groups, conv) => {
    const dateKey = formatDate(conv.createdAt);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(conv);
    return groups;
  }, {});

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
    
      {/* Sidebar */}
      <div 
        className={`${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } fixed inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col h-full z-30 transform transition-transform duration-300 ease-in-out`}
      >
        {/* App branding */}
        <div className="px-4 py-5 flex justify-between items-center border-b border-slate-700">
          <Link href="/chat" className="flex items-center">
            <span className="text-xl font-semibold text-white">Digital Companion</span>
          </Link>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {/* New Chat Button */}
        <div className="p-4">
          <button 
            onClick={handleNewChat}
            disabled={isCreatingNew}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-lg flex items-center justify-center transition-colors duration-200"
          >
            {isCreatingNew ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            New Chat
          </button>
        </div>
        
        {/* Conversations List */}
        <div className="flex-grow overflow-y-auto scrollbar">
          {Object.entries(groupedConversations).length > 0 ? (
            Object.entries(groupedConversations).map(([date, convs]) => (
              <div key={date} className="mb-4">
                <h3 className="px-4 py-1 text-xs uppercase text-slate-500 font-medium">{date}</h3>
                <ul>
                  {convs.map((conversation) => (
                    <li key={conversation.id} className="px-2">
                      <button
                        onClick={() => {
                          setActiveConversation(conversation.id);
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full px-3 py-2.5 text-left truncate rounded-md transition-colors duration-150 ${
                          conversation.id === activeConversation 
                            ? 'bg-slate-700 text-white' 
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="mr-2">💬</span>
                          <span className="truncate">{conversation.title}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-slate-500">
              No conversations yet
            </div>
          )}
        </div>
        
        {/* User Info and Links */}
        <div className="p-4 border-t border-slate-700 bg-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                {user?.displayName?.[0] || user?.email?.[0] || '?'}
              </div>
              <div className="ml-2.5 truncate">
                <div className="text-sm font-medium">{user?.displayName || 'User'}</div>
                <div className="text-xs text-slate-400 truncate">{user?.email || ''}</div>
              </div>
            </div>
            
            {/* User menu dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 bottom-full mb-2 w-40 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-10">
                  <Link 
                    href="/history" 
                    className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                    onClick={() => setDropdownOpen(false)}
                  >
                    History
                  </Link>
                  <Link 
                    href="/settings" 
                    className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Settings
                  </Link>
                  <button 
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }} 
                    className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white border-t border-slate-700"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile header with toggle button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center px-4 z-10">
        <button
          onClick={toggleMobileSidebar}
          className="text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div className="ml-4 text-lg font-semibold">Digital Companion</div>
      </div>
    </>
  );
}
