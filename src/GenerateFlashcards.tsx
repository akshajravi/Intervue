import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { generateFlashcards } from './api/openai';
import { db, auth } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import Modal from './components/Modal';

interface Flashcard {
  question: string;
  answer: string;
}

function GenerateFlashcards() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [numCards, setNumCards] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCards, setGeneratedCards] = useState<Flashcard[]>([]);
  const [setName, setSetName] = useState('');
  const [cardType, setCardType] = useState<'behavioral' | 'technical'>('behavioral');
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'confirm' | 'success' | 'error';
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm'
  });

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setModalConfig({
        isOpen: true,
        title: 'Error',
        message: 'Please enter a topic',
        type: 'error'
      });
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      const prompt =
        cardType === 'behavioral'
          ? `Generate ${numCards} behavioral interview questions on ${topic}. Return a JSON array of objects with only a "question" field, no answers. Example: [ { "question": "..." }, ... ]\nMake sure the questions are relevant to ${topic}.`
          : `Generate ${numCards} technical interview flashcards on ${topic}. Each should include a "question" and "answer" in JSON format:\n[\n  {\n    "question": "...",\n    "answer": "..."\n  },\n  ...\n]\nMake sure the questions are relevant to ${topic} and the answers are concise but informative. The flashcards should be strictly technical type only.`;

      console.log('Sending prompt to OpenAI:', prompt);
      const cards = await generateFlashcards(prompt);
      console.log('Received response from OpenAI:', cards);
      
      if (!Array.isArray(cards)) {
        throw new Error('Invalid response format from OpenAI');
      }
      
      setGeneratedCards(cards);
    } catch (err: any) {
      console.error('Error generating flashcards:', err);
      setModalConfig({
        isOpen: true,
        title: 'Error',
        message: err.message || 'Failed to generate flashcards. Please try again.',
        type: 'error'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!setName.trim()) {
      setModalConfig({
        isOpen: true,
        title: 'Error',
        message: 'Please enter a set name',
        type: 'error'
      });
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        setModalConfig({
          isOpen: true,
          title: 'Error',
          message: 'Please log in to save flashcard sets',
          type: 'error'
        });
        return;
      }

      const userSetsRef = collection(db, `users/${user.uid}/flashcardSets`);
      await addDoc(userSetsRef, {
        name: setName.trim(),
        description: `AI-generated set about ${topic}`,
        cards: generatedCards,
        createdAt: new Date(),
        cardType: cardType
      });

      setModalConfig({
        isOpen: true,
        title: 'Success',
        message: 'Flashcard set saved successfully!',
        type: 'success',
        onConfirm: () => navigate('/flashcards-menu')
      });
    } catch (err) {
      console.error('Error saving flashcard set:', err);
      setModalConfig({
        isOpen: true,
        title: 'Error',
        message: 'Failed to save flashcard set',
        type: 'error'
      });
    }
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <>
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
            Generate Flashcard Set
          </h1>

          {error && (
            <div style={{
              backgroundColor: '#ffebee',
              color: '#c62828',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              {error}
            </div>
          )}

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            marginBottom: '2rem'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#666'
              }}>
                Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., JavaScript, React, System Design"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                  fontFamily: 'Varela Round, sans-serif'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#666'
              }}>
                Number of Cards
              </label>
              <input
                type="number"
                value={numCards}
                onChange={(e) => setNumCards(Math.max(1, Math.min(20, parseInt(e.target.value) || 5)))}
                min="1"
                max="20"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                  fontFamily: 'Varela Round, sans-serif'
                }}
              />
            </div>

            {/* Card Type Toggle */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
              <label style={{ display: 'block', margin: '2rem 0', width: 'fit-content' }}>
                <input
                  className="theme-toggle-checkbox"
                  type="checkbox"
                  checked={cardType === 'technical'}
                  onChange={() => setCardType(cardType === 'behavioral' ? 'technical' : 'behavioral')}
                  style={{ position: 'absolute', opacity: 0, cursor: 'pointer', height: 0, width: 0 }}
                />
                <div className="theme-toggle-slot">
                  <div className="theme-toggle-button"></div>
                </div>
                <style>{`
.theme-toggle-slot {
  position: relative;
  width: 4.5em;
  height: 2em;
  background: ${cardType === 'technical' ? '#b73e3e' : 'white'};
  border: 2px solid #b73e3e;
  border-radius: 2em;
  transition: background 0.3s;
  box-shadow: 0 2px 8px rgba(183,62,62,0.08);
}
.theme-toggle-button {
  position: absolute;
  top: 0.15em;
  left: ${cardType === 'technical' ? '2.3em' : '0.15em'};
  width: 1.7em;
  height: 1.7em;
  background: ${cardType === 'technical' ? '#fff' : '#b73e3e'};
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(183,62,62,0.15);
  transition: left 0.3s, background 0.3s;
  border: 2px solid #b73e3e;
}
                `}</style>
              </label>
              <div style={{ textAlign: 'center', marginTop: '0.75em', fontWeight: 600, fontFamily: 'Varela Round, sans-serif', fontSize: '1.1em', color: '#b73e3e' }}>
                {cardType === 'behavioral' ? 'Behavioral' : 'Technical'}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#b73e3e',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'Varela Round, sans-serif',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                opacity: isGenerating || !topic.trim() ? 0.5 : 1,
                transition: 'opacity 0.2s'
              }}
            >
              {isGenerating ? 'Generating...' : 'Generate Flashcards'}
            </button>
          </div>

          {generatedCards.length > 0 && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{
                color: '#b73e3e',
                marginBottom: '1.5rem'
              }}>
                Generated Flashcards
              </h2>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#666'
                }}>
                  Set Name
                </label>
                <input
                  type="text"
                  value={setName}
                  onChange={(e) => setSetName(e.target.value)}
                  placeholder="Enter a name for this set"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '1rem',
                    fontFamily: 'Varela Round, sans-serif',
                    marginBottom: '1.5rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                {generatedCards.map((card, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '1rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      marginBottom: '0.5rem'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      Q: {card.question}
                    </div>
                    <div>
                      A: {card.answer}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSave}
                disabled={!setName.trim()}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#b73e3e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'Varela Round, sans-serif',
                  cursor: 'pointer',
                  opacity: !setName.trim() ? 0.5 : 1,
                  transition: 'opacity 0.2s'
                }}
              >
                Save Flashcard Set
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </>
  );
}

export default GenerateFlashcards; 