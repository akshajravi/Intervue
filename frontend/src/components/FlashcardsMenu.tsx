import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { auth } from '../firebase'; // adjust if your path is different
import Modal from './Modal';

interface FlashcardSet {
  id: string;
  name: string;
  description: string;
  cards: { question: string; answer: string }[];
  createdAt: Date;
  cardType?: 'behavioral' | 'technical';
}

function FlashcardsMenu() {
  const [userSets, setUserSets] = useState<FlashcardSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
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
  const navigate = useNavigate();

  const fetchUserSets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const user = auth.currentUser;
      if (!user) {
        setError('Please log in to view your flashcard sets');
        return;
      }

      const db = getFirestore();
      const setsRef = collection(db, `users/${user.uid}/flashcardSets`);
      const snapshot = await getDocs(setsRef);

      const sets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as FlashcardSet[];

      // Sort sets by creation date, newest first
      sets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setUserSets(sets);
    } catch (err) {
      console.error('Error fetching flashcard sets:', err);
      setError('Failed to load flashcard sets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserSets();
  }, []);

  const handleDelete = async (setId: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Delete Flashcard Set',
      message: 'Are you sure you want to delete this flashcard set? This action cannot be undone.',
      type: 'confirm',
      onConfirm: async () => {
        try {
          setIsDeleting(setId);
          const user = auth.currentUser;
          if (!user) {
            throw new Error('Please log in to delete flashcard sets');
          }

          const db = getFirestore();
          const setRef = doc(db, `users/${user.uid}/flashcardSets/${setId}`);
          await deleteDoc(setRef);

          // Update the local state
          setUserSets(prevSets => prevSets.filter(set => set.id !== setId));
          
          // Show success message
          setModalConfig({
            isOpen: true,
            title: 'Success',
            message: 'Flashcard set has been deleted successfully.',
            type: 'success'
          });
        } catch (err) {
          console.error('Error deleting flashcard set:', err);
          setModalConfig({
            isOpen: true,
            title: 'Error',
            message: 'Failed to delete flashcard set. Please try again.',
            type: 'error'
          });
        } finally {
          setIsDeleting(null);
        }
      }
    });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        padding: '2rem',
        backgroundColor: '#fff7f1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: '#b73e3e' }}>
          Loading your flashcard sets...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        padding: '2rem',
        backgroundColor: '#fff7f1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          textAlign: 'center', 
          color: '#b73e3e',
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ marginBottom: '1rem' }}>Oops!</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        style={{
          minHeight: '100vh',
          padding: '2.4rem',
          backgroundColor: '#fff7f1',
        }}
      >
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '2.4rem',
          color: '#b73e3e',
          fontFamily: 'Varela Round, sans-serif',
          fontSize: '2.4rem'
        }}>
          Your Flashcard Sets
        </h1>

        {userSets.length === 0 ? (
          <div style={{
            textAlign: 'center',
            backgroundColor: 'white',
            padding: '2.4rem',
            borderRadius: '14.4px',
            boxShadow: '0 4.8px 7.2px rgba(0, 0, 0, 0.1)',
            maxWidth: '720px',
            margin: '0 auto'
          }}>
            <h2 style={{ 
              color: '#b73e3e',
              marginBottom: '1.2rem',
              fontFamily: 'Varela Round, sans-serif',
              fontSize: '1.44rem'
            }}>
              No Flashcard Sets Yet
            </h2>
            <p style={{ 
              color: '#666',
              marginBottom: '2.4rem',
              fontSize: '1.2rem'
            }}>
              Create your first flashcard set to get started!
            </p>
            <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '2.4rem', justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/add-flashcard')}
                style={{
                  padding: '0.9rem 1.8rem',
                  backgroundColor: '#b73e3e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '9.6px',
                  fontSize: '1.2rem',
                  fontFamily: 'Varela Round, sans-serif',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Create New Set
              </button>

              <button
                onClick={() => navigate('/generate-flashcards')}
                style={{
                  padding: '0.9rem 1.8rem',
                  backgroundColor: '#4a90e2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '9.6px',
                  fontSize: '1.2rem',
                  fontFamily: 'Varela Round, sans-serif',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                Generate with AI
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '2.4rem',
            maxWidth: '1440px',
            margin: '0 auto'
          }}>
            {userSets.map((set) => (
              <div
                key={set.id}
                style={{
                  position: 'relative',
                  backgroundColor: 'white',
                  borderRadius: '14.4px',
                  padding: '1.8rem',
                  boxShadow: '0 4.8px 7.2px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease-in-out'
                }}
              >
                <Link 
                  to={`/practice/${set.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <h2 style={{ 
                      color: '#b73e3e',
                      marginBottom: '1.2rem',
                      fontFamily: 'Varela Round, sans-serif',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.9rem',
                      fontSize: '1.44rem'
                    }}>
                      {set.name}
                    </h2>
                    <p style={{ 
                      color: '#666',
                      marginBottom: '1.2rem',
                      fontSize: '1.2rem',
                      lineHeight: '1.5'
                    }}>
                      {set.description}
                    </p>
                    <div style={{ 
                      color: '#888',
                      fontSize: '1.296rem',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.96em',
                      marginBottom: '0.6em'
                    }}>
                      <span>{set.cards.length} cards</span>
                      {set.cardType && (
                        <span style={{
                          backgroundColor: set.cardType === 'technical' ? '#e5f0ff' : '#ffe5e5',
                          color: set.cardType === 'technical' ? '#4a90e2' : '#b73e3e',
                          border: `1px solid ${set.cardType === 'technical' ? '#4a90e2' : '#b73e3e'}`,
                          borderRadius: '999px',
                          padding: '0.024em 0.456em',
                          fontSize: '0.744em',
                          fontWeight: 400,
                          letterSpacing: '0.24px',
                          textTransform: 'capitalize',
                          display: 'inline-block',
                          lineHeight: 1.1
                        }}>
                          {set.cardType === 'technical' ? 'Technical' : 'Behavioral'}
                        </span>
                      )}
                      <span>Created {set.createdAt.toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                </Link>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(set.id);
                  }}
                  disabled={isDeleting === set.id}
                  style={{
                    position: 'absolute',
                    top: '1.2rem',
                    right: '1.2rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#b73e3e',
                    cursor: 'pointer',
                    padding: '0.6rem',
                    borderRadius: '4.8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isDeleting === set.id ? 0.5 : 1,
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(183, 62, 62, 0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    fill="none" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))}

            {/* Add Custom Set Box */}
            <Link 
              to="/add-flashcard"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '14.4px',
                  padding: '1.8rem',
                  boxShadow: '0 4.8px 7.2px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease-in-out',
                  border: '2.4px dashed #b73e3e',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '240px'
                }}
              >
                <div style={{ 
                  color: '#b73e3e',
                  fontSize: '2.4rem',
                  marginBottom: '1.2rem'
                }}>
                  +
                </div>
                <h2 style={{ 
                  color: '#b73e3e',
                  marginBottom: '0.6rem',
                  fontFamily: 'Varela Round, sans-serif',
                  textAlign: 'center',
                  fontSize: '1.44rem'
                }}>
                  Create New Set
                </h2>
                <p style={{ 
                  color: '#666',
                  fontSize: '1.2rem',
                  lineHeight: '1.5',
                  textAlign: 'center'
                }}>
                  Add custom flashcards for your specific needs
                </p>
              </motion.div>
            </Link>

            {/* Generate with AI Box */}
            <div 
              onClick={() => navigate('/generate-flashcards')}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '14.4px',
                  padding: '1.8rem',
                  boxShadow: '0 4.8px 7.2px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease-in-out',
                  border: '2.4px dashed #4a90e2',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '240px'
                }}
              >
                <div style={{ 
                  color: '#4a90e2',
                  fontSize: '2.4rem',
                  marginBottom: '1.2rem'
                }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
                    <path d="M12 8v8M8 12h8" />
                  </svg>
                </div>
                <h2 style={{ 
                  color: '#4a90e2',
                  marginBottom: '0.6rem',
                  fontFamily: 'Varela Round, sans-serif',
                  textAlign: 'center',
                  fontSize: '1.44rem'
                }}>
                  Generate with AI
                </h2>
                <p style={{ 
                  color: '#666',
                  fontSize: '1.2rem',
                  lineHeight: '1.5',
                  textAlign: 'center'
                }}>
                  Let AI create flashcards for you
                </p>
              </motion.div>
            </div>
          </div>
        )}
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

export default FlashcardsMenu;