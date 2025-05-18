'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function SettingsPage() {
  const { user, updateUserProfile } = useAuth();
  const router = useRouter();
  
  const [displayName, setDisplayName] = useState('');
  const [defaultModel, setDefaultModel] = useState('gemini');
  const [defaultPersona, setDefaultPersona] = useState('romantic');
  const [darkMode, setDarkMode] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    gemini: '',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Load user settings
  useEffect(() => {
    async function loadSettings() {
      if (!user) return;
      
      try {
        // Set display name from auth user
        setDisplayName(user.displayName || '');
        
        // Get user settings from Firestore
        const settingsRef = doc(db, 'userSettings', user.uid);
        const settingsSnap = await getDoc(settingsRef);
        
        if (settingsSnap.exists()) {
          const settings = settingsSnap.data();
          setDefaultModel(settings.defaultModel || 'gemini');
          setDefaultPersona(settings.defaultPersona || 'romantic');
          setDarkMode(settings.darkMode || false);
          
          // Load API keys if they exist
          const apiKeysRef = doc(db, 'userApiKeys', user.uid);
          const apiKeysSnap = await getDoc(apiKeysRef);
          
          if (apiKeysSnap.exists()) {
            setApiKeys(apiKeysSnap.data());
          }
        }
      } catch (error) {
        console.error('Error loading user settings:', error);
        setErrorMessage('Failed to load settings. Please try again later.');
      }
    }
    
    loadSettings();
  }, [user]);
  
  // Save user settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      // Update auth profile (display name)
      if (user.displayName !== displayName) {
        await updateUserProfile({ displayName });
      }
      
      // Save user settings to Firestore
      const settingsRef = doc(db, 'userSettings', user.uid);
      await setDoc(settingsRef, {
        defaultModel,
        defaultPersona,
        darkMode,
        updatedAt: new Date()
      }, { merge: true });
      
      // Save API keys separately (more secure)
      const apiKeysRef = doc(db, 'userApiKeys', user.uid);
      await setDoc(apiKeysRef, apiKeys, { merge: true });
      
      setSuccessMessage('Settings saved successfully');
      
      // Apply dark mode if changed
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setErrorMessage('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 pb-12">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
        </header>
        
        <main className="max-w-3xl mx-auto px-4 py-8">
          {/* Success/error messages */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}
          
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
              {errorMessage}
            </div>
          )}
          
          <form onSubmit={handleSaveSettings}>
            {/* Account Settings */}
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-medium">Account Settings</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="px-3 py-2 border rounded-lg bg-gray-50 text-gray-500">
                    {user?.email || 'No email available'}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>
              </div>
            </div>
            
            {/* Chat Preferences */}
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-medium">Chat Preferences</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="defaultModel" className="block text-sm font-medium text-gray-700 mb-1">
                    Default AI Model
                  </label>
                  <select
                    id="defaultModel"
                    value={defaultModel}
                    onChange={(e) => setDefaultModel(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="gemini">Google Gemini</option>
                    <option value="gpt">OpenAI GPT</option>
                    <option value="claude">Anthropic Claude</option>
                    <option value="llama">Meta Llama</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="defaultPersona" className="block text-sm font-medium text-gray-700 mb-1">
                    Default Persona
                  </label>
                  <select
                    id="defaultPersona"
                    value={defaultPersona}
                    onChange={(e) => setDefaultPersona(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="romantic">Romantic Companion 💖</option>
                    <option value="professional">Professional Mentor 👔</option>
                    <option value="creative">Creative Partner 🎨</option>
                    <option value="motivational">Motivational Coach 💪</option>
                    <option value="wellness">Wellness Advisor 🧘</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="darkMode"
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  />
                  <label htmlFor="darkMode" className="ml-2 block text-sm text-gray-700">
                    Enable Dark Mode
                  </label>
                </div>
              </div>
            </div>
            
            {/* API Keys */}
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-medium">API Keys</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Add your own API keys to use your own models. These keys are encrypted and stored securely.
                </p>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="openaiKey" className="block text-sm font-medium text-gray-700 mb-1">
                    OpenAI API Key
                  </label>
                  <input
                    id="openaiKey"
                    type="password"
                    value={apiKeys.openai}
                    onChange={(e) => setApiKeys({...apiKeys, openai: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="sk-..."
                  />
                </div>
                
                <div>
                  <label htmlFor="anthropicKey" className="block text-sm font-medium text-gray-700 mb-1">
                    Anthropic API Key
                  </label>
                  <input
                    id="anthropicKey"
                    type="password"
                    value={apiKeys.anthropic}
                    onChange={(e) => setApiKeys({...apiKeys, anthropic: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="sk_ant-..."
                  />
                </div>
                
                <div>
                  <label htmlFor="geminiKey" className="block text-sm font-medium text-gray-700 mb-1">
                    Google Gemini API Key
                  </label>
                  <input
                    id="geminiKey"
                    type="password"
                    value={apiKeys.gemini}
                    onChange={(e) => setApiKeys({...apiKeys, gemini: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="AIzaSy..."
                  />
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => router.push('/chat')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Back to Chat
              </button>
              
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:bg-pink-400"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  );
}
