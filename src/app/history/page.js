'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import { getUserConversations, deleteConversation, getUserFolders, createFolder, moveConversationToFolder } from '@/lib/firebase/conversation-service';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversations, setSelectedConversations] = useState([]);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load conversations and folders
  useEffect(() => {
    async function loadData() {
      if (user) {
        try {
          setLoading(true);
          
          // Load conversations
          const conversationsData = await getUserConversations(user.uid);
          setConversations(conversationsData);
          
          // Load folders
          const foldersData = await getUserFolders(user.uid);
          setFolders(foldersData);
        } catch (error) {
          console.error('Error loading history data:', error);
        } finally {
          setLoading(false);
        }
      }
    }
    
    loadData();
  }, [user]);
  
  // Filter conversations based on search and selected folder
  const filteredConversations = conversations.filter(conversation => {
    // Filter by folder if selected
    if (selectedFolder && conversation.folderId !== selectedFolder.id) {
      return false;
    }
    
    // Filter by search query if provided
    if (searchQuery) {
      return conversation.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    return true;
  });
  
  // Handle conversation selection
  const toggleConversationSelection = (id) => {
    setSelectedConversations(prev => {
      if (prev.includes(id)) {
        return prev.filter(convId => convId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // Handle delete selected conversations
  const handleDeleteSelected = async () => {
    if (confirm(`Are you sure you want to delete ${selectedConversations.length} conversation(s)?`)) {
      try {
        // Delete each selected conversation
        for (const id of selectedConversations) {
          await deleteConversation(id);
        }
        
        // Update the conversations list
        setConversations(prev => prev.filter(conv => !selectedConversations.includes(conv.id)));
        setSelectedConversations([]);
      } catch (error) {
        console.error('Error deleting conversations:', error);
        alert('Failed to delete conversations. Please try again.');
      }
    }
  };
  
  // Create a new folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      const folderId = await createFolder(user.uid, newFolderName.trim());
      
      // Add the new folder to the list
      const newFolder = {
        id: folderId,
        name: newFolderName.trim(),
        userId: user.uid
      };
      
      setFolders(prev => [...prev, newFolder]);
      setNewFolderName('');
      setIsCreatingFolder(false);
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Failed to create folder. Please try again.');
    }
  };
  
  // Move selected conversations to a folder
  const handleMoveToFolder = async (folderId) => {
    try {
      // Move each selected conversation
      for (const id of selectedConversations) {
        await moveConversationToFolder(id, folderId);
      }
      
      // Update the conversations list
      setConversations(prev => prev.map(conv => {
        if (selectedConversations.includes(conv.id)) {
          return { ...conv, folderId };
        }
        return conv;
      }));
      
      setSelectedConversations([]);
    } catch (error) {
      console.error('Error moving conversations:', error);
      alert('Failed to move conversations. Please try again.');
    }
  };
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Conversation History</h1>
            
            <div className="flex space-x-2">
              <Link 
                href="/chat" 
                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg"
              >
                New Chat
              </Link>
              
              <Link 
                href="/" 
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
              >
                Home
              </Link>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
            {/* Search bar */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Folder selection */}
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setSelectedFolder(null)}
                className={`px-3 py-1 rounded-full text-sm ${!selectedFolder ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                All
              </button>
              
              {folders.map(folder => (
                <button 
                  key={folder.id} 
                  onClick={() => setSelectedFolder(folder)}
                  className={`px-3 py-1 rounded-full text-sm ${selectedFolder?.id === folder.id ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  {folder.name}
                </button>
              ))}
              
              {isCreatingFolder ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="Folder name"
                    className="px-2 py-1 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateFolder();
                      if (e.key === 'Escape') {
                        setIsCreatingFolder(false);
                        setNewFolderName('');
                      }
                    }}
                    autoFocus
                  />
                  <button 
                    onClick={handleCreateFolder}
                    className="p-1 bg-green-600 text-white rounded-full text-sm"
                  >
                    ✓
                  </button>
                  <button 
                    onClick={() => {
                      setIsCreatingFolder(false);
                      setNewFolderName('');
                    }}
                    className="p-1 bg-red-600 text-white rounded-full text-sm"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsCreatingFolder(true)}
                  className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm flex items-center"
                >
                  <span className="mr-1">+</span> New Folder
                </button>
              )}
            </div>
          </div>
          
          {/* Bulk actions when conversations are selected */}
          {selectedConversations.length > 0 && (
            <div className="mb-4 p-3 bg-gray-100 rounded-lg flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">
                {selectedConversations.length} selected
              </span>
              
              <div className="ml-auto flex gap-2">
                <div className="relative">
                  <select
                    className="appearance-none pl-3 pr-8 py-1 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
                    onChange={(e) => {
                      if (e.target.value) handleMoveToFolder(e.target.value);
                      e.target.value = '';
                    }}
                  >
                    <option value="">Move to folder...</option>
                    {folders.map(folder => (
                      <option key={folder.id} value={folder.id}>{folder.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <button 
                  onClick={handleDeleteSelected}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                >
                  Delete
                </button>
                
                <button 
                  onClick={() => setSelectedConversations([])}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          {/* Conversations list */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
            </div>
          ) : filteredConversations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredConversations.map((conversation) => (
                <div 
                  key={conversation.id} 
                  className={`bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow 
                    ${selectedConversations.includes(conversation.id) ? 'ring-2 ring-pink-500' : ''}`}
                >
                  <div className="flex items-start">
                    {/* Checkbox for selection */}
                    <input
                      type="checkbox"
                      checked={selectedConversations.includes(conversation.id)}
                      onChange={() => toggleConversationSelection(conversation.id)}
                      className="mr-3 mt-1"
                    />
                    
                    <div className="flex-grow">
                      {/* Title and timestamp */}
                      <div className="mb-2">
                        <h3 className="font-medium truncate">{conversation.title}</h3>
                        <p className="text-xs text-gray-500">
                          {conversation.createdAt?.toDate ? 
                            conversation.createdAt.toDate().toLocaleDateString() : 
                            new Date(conversation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      {/* Model and persona badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {conversation.modelId && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {conversation.modelId}
                          </span>
                        )}
                        
                        {conversation.personaId && (
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                            {conversation.personaId}
                          </span>
                        )}
                      </div>
                      
                      {/* Folder badge */}
                      {conversation.folderId && (
                        <div className="mb-3">
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded flex items-center w-fit">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                            </svg>
                            {folders.find(f => f.id === conversation.folderId)?.name || 'Unknown folder'}
                          </span>
                        </div>
                      )}
                      
                      {/* Preview text (if available) */}
                      {conversation.messages && conversation.messages.length > 0 && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {conversation.messages[0].content}
                        </p>
                      )}
                      
                      {/* Action buttons */}
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => router.push(`/chat?id=${conversation.id}`)}
                          className="text-sm text-pink-600 hover:text-pink-700"
                        >
                          Continue Chat &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-500 mb-2">No conversations found</h3>
              <p className="text-gray-400">
                {searchQuery ? 'Try changing your search query' : 'Start a new chat to begin'}
              </p>
              
              {!searchQuery && (
                <Link
                  href="/chat"
                  className="inline-block mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                >
                  Start New Chat
                </Link>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
