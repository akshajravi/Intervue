import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db, auth } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import Modal from './components/Modal';

function AddFlashcard() {
  const navigate = useNavigate();
  const [setName, setSetName] = useState('');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [cards, setCards] = useState<{ question: string; answer: string }[]>([]);
  const [showCardCreation, setShowCardCreation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
  const [cardType, setCardType] = useState<'behavioral' | 'technical'>('behavioral');

  const handleSetNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (setName.trim()) {
      setShowCardCreation(true);
    }
  };

  const handleAddCard = () => {
    if (!front.trim() || !back.trim()) return;
    setCards([...cards, { question: front, answer: back }]);
    setFront('');
    setBack('');
  };

  const handleSaveSet = async () => {
    if (!setName.trim() || cards.length === 0) {
      setModalConfig({
        isOpen: true,
        title: 'Error',
        message: 'Please add at least one card.',
        type: 'error'
      });
      return;
    }

    try {
      setIsSaving(true);
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Please log in to save flashcard sets');
      }

      const userSetsRef = collection(db, `users/${user.uid}/flashcardSets`);
      await addDoc(userSetsRef, {
        name: setName.trim(),
        description: 'Custom flashcard set',
        cards,
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
    } catch (error) {
      console.error('Error saving flashcard set:', error);
      setModalConfig({
        isOpen: true,
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save flashcard set',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  if (!showCardCreation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        style={{ minHeight: '100vh', padding: '2rem', backgroundColor: '#fff7f1' }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
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

          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ 
              color: '#b73e3e',
              fontFamily: 'Varela Round, sans-serif',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              Name Your Flashcard Set
            </h2>

            <form onSubmit={handleSetNameSubmit}>
              <input
                type="text"
                value={setName}
                onChange={(e) => setSetName(e.target.value)}
                placeholder="Enter set name"
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
                type="submit"
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
                Create Set
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        style={{ minHeight: '100vh', padding: '2rem', backgroundColor: '#fff7f1' }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
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

          <h2 style={{ 
            color: '#b73e3e',
            fontFamily: 'Varela Round, sans-serif',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            Create Cards for "{setName}"
          </h2>

          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666', fontFamily: 'Varela Round, sans-serif' }}>
              Front of Card
            </label>
            <textarea
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '1rem',
                fontFamily: 'Varela Round, sans-serif',
                resize: 'vertical',
                minHeight: '100px',
                marginBottom: '1.5rem'
              }}
              placeholder="Enter question or term"
              value={front}
              onChange={(e) => setFront(e.target.value)}
            />

            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666', fontFamily: 'Varela Round, sans-serif' }}>
              Back of Card
            </label>
            <textarea
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '1rem',
                fontFamily: 'Varela Round, sans-serif',
                resize: 'vertical',
                minHeight: '100px',
                marginBottom: '1.5rem'
              }}
              placeholder="Enter answer or explanation"
              value={back}
              onChange={(e) => setBack(e.target.value)}
            />

            <button
              onClick={handleAddCard}
              disabled={!front.trim() || !back.trim()}
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
                opacity: (!front.trim() || !back.trim()) ? 0.5 : 1,
                transition: 'opacity 0.2s',
                marginBottom: '1rem'
              }}
            >
              Add Card to Set
            </button>
          </div>

          {cards.length > 0 && (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
              <h3 style={{ 
                color: '#b73e3e',
                fontFamily: 'Varela Round, sans-serif',
                marginBottom: '1rem'
              }}>
                Cards in Set ({cards.length})
              </h3>
              <div style={{ marginBottom: '1.5rem' }}>
                {cards.map((card, index) => (
                  <div key={index} style={{ 
                    padding: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Q: {card.question}</div>
                    <div>A: {card.answer}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleSaveSet}
                disabled={isSaving}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#b73e3e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'Varela Round, sans-serif',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.7 : 1,
                  transition: 'opacity 0.2s'
                }}
              >
                {isSaving ? 'Saving...' : 'Save Flashcard Set'}
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

export default AddFlashcard;