# Meri Digital Saheli - Personal AI Companion

A next-generation AI companion application built with Next.js, Tailwind CSS, and Firebase, supporting multiple AI models and personas.

## Features

### Core Functionalities
- **Multi-Model Support**: Integration with Google Gemini, OpenAI GPT, Anthropic Claude, and Meta's Llama models
- **Multiple Personas**: Different AI personalities including Romantic Companion, Professional Mentor, Creative Partner, and more
- **Conversation Management**: ChatGPT-like interface with history, organization, and search
- **User Authentication**: Secure login with email/password and OAuth options
- **Responsive Design**: Beautiful UI that works on mobile and desktop

### Technical Features
- **Next.js App Router**: Modern Next.js application using the App Router for page routing
- **Firebase Integration**: Authentication, Firestore database, and Storage
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Environment Variables**: Secure API key management
- **Progressive Web App**: Installable on mobile devices

## Getting Started

### Prerequisites
- Node.js 18.0.0 or later
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/digital-companion.git
cd digital-companion
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Create a `.env.local` file in the root directory with your Firebase and API credentials:
```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id

# AI Model API Keys
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_OPENAI_API_KEY=your-openai-api-key
NEXT_PUBLIC_ANTHROPIC_API_KEY=your-anthropic-api-key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
digital-companion/
├── app/                    # Next.js app directory
│   ├── api/                # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   └── chat/           # Chat processing endpoints
│   ├── chat/               # Chat interface pages
│   ├── history/            # Chat history pages
│   ├── settings/           # User settings pages
│   ├── page.js             # Homepage
│   └── layout.js           # Root layout
├── components/             # Reusable UI components
│   ├── auth/               # Authentication components
│   ├── chat/               # Chat-related components
│   ├── common/             # Common UI elements
│   └── settings/           # Settings-related components
├── lib/                    # Utility functions
│   ├── firebase/           # Firebase configuration
│   └── models/             # AI model integrations
├── personas/               # AI personality definitions
│   └── index.js            # Persona management
├── public/                 # Static assets
├── .env.local              # Environment variables
└── next.config.js          # Next.js configuration
```

## Development Roadmap

### Phase 1: Core Features (Current)
- User authentication
- Basic chat functionality
- Multiple AI model integration
- Persona system

### Phase 2: Enhanced Features
- Voice input/output
- Image generation
- Custom persona creation
- Advanced history management

### Phase 3: Premium Features
- Subscription management
- Extended message limits
- Priority API access
- Advanced customization options