import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: 'confirm' | 'success' | 'error';
}

function Modal({ isOpen, onClose, onConfirm, title, message, type = 'confirm' }: ModalProps) {
  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          primary: '#4a90e2',
          secondary: '#e8f1fd',
          text: '#2c5282'
        };
      case 'error':
        return {
          primary: '#b73e3e',
          secondary: '#fde8e8',
          text: '#742a2a'
        };
      default:
        return {
          primary: '#b73e3e',
          secondary: '#fff7f1',
          text: '#742a2a'
        };
    }
  };

  const colors = getColors();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{
              color: colors.primary,
              marginBottom: '1rem',
              fontFamily: 'Varela Round, sans-serif',
              fontSize: '1.5rem'
            }}>
              {title}
            </h2>
            <p style={{
              color: colors.text,
              marginBottom: '2rem',
              fontSize: '1rem',
              lineHeight: '1.5'
            }}>
              {message}
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              {type === 'confirm' && (
                <button
                  onClick={onClose}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'transparent',
                    color: colors.primary,
                    border: `1px solid ${colors.primary}`,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontFamily: 'Varela Round, sans-serif',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = colors.secondary}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Cancel
                </button>
              )}
              <button
                onClick={type === 'confirm' ? onConfirm : onClose}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'Varela Round, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out'
                }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                {type === 'confirm' ? 'Confirm' : 'Close'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Modal; 