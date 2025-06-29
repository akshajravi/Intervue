// src/App.tsx

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Import your components/pages
import Navbar from './Navbar';
import Landing from './Landing';
import About from './About';
import Login from './Login';
import Dashboard from './Dashboard';
import Practice from './Practice';
import FlashcardsMenu from './FlashcardsMenu';
import AddFlashcard from './AddFlashcard';
import GenerateFlashcards from './GenerateFlashcards';

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
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        <AnimatedRoutes />
      </div>
    </Router>
  );
}

export default App;