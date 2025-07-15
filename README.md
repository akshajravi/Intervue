# 🎯 Intervue

An AI-powered interview preparation platform that helps you ace technical interviews through realistic mock interviews, flashcard study sessions, and voice-interactive coding practice.

## ✨ Features

### 🤖 Mock Technical Interviews
- **AI-powered interviewer** that asks realistic technical questions
- **Voice interaction** - speak your answers naturally or type responses
- **Live coding environment** with Monaco editor
- **Real-time feedback** on your solutions and approach
- **Multiple difficulty levels** from easy to hard
- **Various question categories** including algorithms, data structures, system design

### 📚 Flashcard Learning System
- **AI-generated flashcards** for interview preparation
- **Behavioral and technical questions** using STAR method
- **Personal flashcard creation** and management
- **Progress tracking** across study sessions
- **Firebase integration** for cloud storage

### 🎙️ Voice-Powered Features
- **Speech-to-text** for natural conversation flow
- **Azure Speech Services** integration
- **Audio analysis** with real-time feedback
- **Voice recordings** for practice review

### 🔧 Advanced Coding Environment
- **Monaco code editor** with syntax highlighting
- **Multiple programming languages** support
- **Auto-completion** and error detection
- **Code execution** and testing capabilities

## 🏗️ Architecture

This is a modern full-stack application built with:

### Frontend (`/frontend`)
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Monaco Editor** for code editing
- **Lucide React** for icons

### Backend (`/backend`)
- **FastAPI** Python web framework
- **PostgreSQL** database with SQLAlchemy ORM
- **OpenAI GPT** integration for AI responses
- **Azure Speech Services** for voice processing
- **CORS enabled** for frontend communication

### External Services
- **Firebase** for authentication and data storage
- **Supabase** for additional data management
- **OpenAI API** for AI-powered responses
- **Azure Cognitive Services** for speech and text analytics

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.9+ 
- **PostgreSQL** database
- API keys for OpenAI, Azure, Firebase

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/akshajravi/Intervue.git
   cd Intervue
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Setup**
   ```bash
   # Frontend environment
   cd frontend
   cp .env.example .env
   # Edit .env with your API keys
   
   # Backend environment  
   cd ../backend
   cp .env.example .env
   # Edit .env with your database URL and API keys
   ```

4. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb intervue_db
   
   # Update DATABASE_URL in backend/.env
   ```

5. **Start Development Servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually:
   npm run dev:frontend  # http://localhost:5173
   npm run dev:backend   # http://localhost:8000
   ```

## 📁 Project Structure

```
Intervue/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── api/            # API integration
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript definitions
│   │   └── utils/          # Helper functions
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Configuration
│   │   ├── db/             # Database setup
│   │   ├── models/         # Data models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic
│   ├── main.py             # FastAPI entry point
│   └── requirements.txt    # Python dependencies
├── package.json            # Root workspace config
└── README.md              # This file
```

## 🔧 Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend
- `npm run dev:frontend` - Start only React app
- `npm run dev:backend` - Start only FastAPI server
- `npm run build` - Build frontend for production
- `npm run install:all` - Install all dependencies

### Frontend (`cd frontend`)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend (`cd backend`)
- `python main.py` - Start FastAPI server
- `pip install -r requirements.txt` - Install dependencies

## 🔑 Environment Variables

### Frontend (`.env`)
```bash
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_AZURE_SPEECH_KEY=your_azure_speech_key
VITE_AZURE_SPEECH_REGION=your_region
```

### Backend (`.env`)
```bash
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your_secret_key
OPENAI_API_KEY=your_openai_api_key
CORS_ORIGINS=http://localhost:5173
```

## 🌐 API Documentation

When running the backend, visit:
- **Interactive API Docs**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc

### Key Endpoints
- `GET /api/v1/health` - Health check
- `POST /api/v1/chat/message` - Send chat message
- `POST /api/v1/chat/voice` - Process voice message
- `GET /api/v1/chat/conversation/{session_id}` - Get conversation history

## 🔐 Security Features

- ✅ **Environment variables** for all sensitive data
- ✅ **No hardcoded API keys** in source code
- ✅ **Comprehensive .gitignore** for secrets
- ✅ **CORS protection** configured
- ✅ **Input validation** with Pydantic schemas
- ✅ **Secure file permissions** on environment files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT API
- **Azure** for Speech Services
- **Firebase** for authentication and storage
- **Supabase** for database services
- **Vite** and **FastAPI** teams for excellent frameworks

---

**Built with ❤️ for helping developers ace their technical interviews**