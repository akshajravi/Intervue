import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Import your components/pages
import Navbar from './components/Navbar';
import Landing from './components/Landing';
import About from './components/About';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Practice from './components/Practice';
import FlashcardsMenu from './components/FlashcardsMenu';
import AddFlashcard from './components/AddFlashcard';
import GenerateFlashcards from './components/GenerateFlashcards';
import MockInterview from './components/MockInterview';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/flashcards-menu" element={<FlashcardsMenu />} />
        <Route path="/practice/:setId" element={<Practice />} />
        <Route path="/add-flashcard" element={<AddFlashcard />} />
        <Route path="/generate-flashcards" element={<GenerateFlashcards />} />
        <Route path="/mock-interview-app" element={<MockInterview />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <AnimatedRoutes />
      </div>
    </Router>
  );
}

export default App;