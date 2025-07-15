import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import VoiceRecorder from './VoiceRecorder';
import '../Practice.css';

interface Flashcard {
  question: string;
  answer: string;
}

interface FlashcardSet {
  id: string;
  name: string;
  description: string;
  cards: Flashcard[];
  createdAt: Date;
}

function Practice() {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentSet, setCurrentSet] = useState<FlashcardSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toneAnalysis, setToneAnalysis] = useState<{
    tone: string;
    features: any;
  } | null>(null);

  useEffect(() => {
    const fetchSet = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const user = auth.currentUser;
        if (!user) {
          setError('Please log in to access flashcard sets');
          setIsLoading(false);
          return;
        }

        if (!setId) {
          setError('Set ID not provided');
          setIsLoading(false);
          return;
        }

        const setRef = doc(db, `users/${user.uid}/flashcardSets/${setId}`);
        const setDoc = await getDoc(setRef);

        if (!setDoc.exists()) {
          setError('Flashcard set not found');
          setIsLoading(false);
          return;
        }

        const setData = setDoc.data();
        setCurrentSet({
          id: setDoc.id,
          name: setData.name,
          description: setData.description,
          cards: setData.cards,
          createdAt: setData.createdAt?.toDate() || new Date()
        });
        setCurrentCardIndex(0);
        setIsFlipped(false);
      } catch (err) {
        console.error('Error fetching flashcard set:', err);
        setError('Failed to load flashcard set');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSet();
  }, [setId]);

  const handleNext = () => {
    if (currentSet && currentCardIndex < currentSet.cards.length - 1) {
      setIsFlipped(false);
      setCurrentCardIndex(currentCardIndex + 1);
      setToneAnalysis(null);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setIsFlipped(false);
      setCurrentCardIndex(currentCardIndex - 1);
      setToneAnalysis(null);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleToneAnalysis = (tone: string, features: any) => {
    setToneAnalysis({ tone, features });
  };

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff7f1'
      }}>
        <div style={{ textAlign: 'center', color: '#b73e3e' }}>
          Loading flashcard set...
        </div>
      </div>
    );
  }

  if (error || !currentSet) {
    return (
      <div style={{ 
        minHeight: '100vh',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff7f1'
      }}>
        <div style={{ 
          textAlign: 'center',
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px'
        }}>
          <h2 style={{ 
            color: '#b73e3e',
            marginBottom: '1rem',
            fontFamily: 'Varela Round, sans-serif'
          }}>
            {error || 'Set not found'}
          </h2>
          <button
            onClick={() => navigate('/flashcards-menu')}
            style={{
              backgroundColor: '#b73e3e',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Varela Round, sans-serif'
            }}
          >
            Back to Sets
          </button>
        </div>
      </div>
    );
  }

  const currentCard = currentSet.cards[currentCardIndex];

  // Safety check for currentCard
  if (!currentCard || !currentSet.cards || currentCardIndex < 0 || currentCardIndex >= currentSet.cards.length) {
    return (
      <div style={{ 
        minHeight: '100vh',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff7f1'
      }}>
        <div style={{ textAlign: 'center', color: '#b73e3e' }}>
          Card not found or invalid index
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      style={{
        minHeight: '100vh',
        padding: '2rem',
        backgroundColor: '#fff7f1',
        fontFamily: 'Varela Round, sans-serif'
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/flashcards-menu')}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: '#b73e3e',
            fontSize: '1rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            marginBottom: '2rem'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(183, 62, 62, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Sets
        </button>

        <h1 style={{
          color: '#b73e3e',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          {currentSet.name}
        </h1>

        <div className="flashcard-container" onClick={() => setIsFlipped(!isFlipped)}>
          <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
            <div className="flashcard-front">
              <h2>Question</h2>
              <p>{currentCard?.question || 'Question not available'}</p>
            </div>
            <div className="flashcard-back">
              <h2>Answer</h2>
              <p>{currentCard?.answer || 'Answer not available'}</p>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '2rem'
        }}>
          <button
            onClick={handlePrevious}
            disabled={currentCardIndex === 0}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#b73e3e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: currentCardIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: currentCardIndex === 0 ? 0.5 : 1
            }}
          >
            Previous
          </button>
          <span style={{ color: '#666' }}>
            Card {currentCardIndex + 1} of {currentSet.cards.length}
          </span>
          <button
            onClick={handleNext}
            disabled={currentCardIndex === currentSet.cards.length - 1}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#b73e3e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: currentCardIndex === currentSet.cards.length - 1 ? 'not-allowed' : 'pointer',
              opacity: currentCardIndex === currentSet.cards.length - 1 ? 0.5 : 1
            }}
          >
            Next
          </button>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h2 style={{
            color: '#b73e3e',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontSize: '1.5rem'
          }}>
            Practice Your Response
          </h2>
          <VoiceRecorder 
            onToneAnalysis={handleToneAnalysis} 
            cardType="behavioral"
            questionText={currentCard?.question || ''}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default Practice;