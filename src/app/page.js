'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/chat');
    }
  }, [user, loading, router]);

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-24 bg-gradient-to-r from-pink-50 to-purple-50">
      <div className="max-w-5xl w-full flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-6">
          Meri Digital Saheli
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-2xl">
          Your personalized AI companion that adapts to your preferences and offers a human-like conversation experience.
        </p>
        
        {loading ? (
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
        ) : !user ? (
          <div className="flex flex-col md:flex-row gap-4">
            <Link 
              href="/signin" 
              className="px-8 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="px-8 py-3 bg-white text-pink-600 border border-pink-600 rounded-lg hover:bg-pink-50 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        ) : null}
        
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            title="Multiple Personas" 
            description="Choose from various AI personalities to match your needs and preferences."
          />
          <FeatureCard 
            title="Multi-Model Support" 
            description="Access different AI models like GPT, Claude, and Gemini for diverse capabilities."
          />
          <FeatureCard 
            title="Conversation History" 
            description="Easily access and manage your past conversations with improved organization."
          />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ title, description }) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

