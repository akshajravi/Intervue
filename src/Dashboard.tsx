import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth } from './firebase';

function Dashboard() {
  const [userName, setUserName] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      // Use displayName if available, otherwise use email
      const name = user.displayName || user.email?.split('@')[0] || 'User';
      setUserName(name);
    }
  }, []);

  const handleCardClick = () => {
    navigate('/flashcards-menu');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      style={{
        minHeight: '100vh',
        backgroundColor: '#fff7f1',
        fontFamily: 'Varela Round, sans-serif'
      }}
    >
      {/* Top Banner */}
      <div
        style={{
          backgroundColor: '#b73e3e',
          color: 'white',
          padding: '1.5rem 2rem',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          fontFamily: 'Varela Round, sans-serif'
        }}
      >
        Hello, {userName}
      </div>

      {/* Main Content */}
      <div style={{ 
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{
          color: '#b73e3e',
          fontSize: '2.5rem',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Welcome to Intervue
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#666',
          textAlign: 'center',
          marginBottom: '3rem',
          maxWidth: '800px',
          margin: '0 auto 3rem auto',
          lineHeight: '1.6'
        }}>
          Your personal interview preparation companion. Practice with our curated flashcard sets or create your own.
        </p>

        {/* Keep the existing button but update its container */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '2rem'
        }}>
          <div className="container-card noselect" onClick={handleCardClick}>
            <div className="canvas-card">
              <div className="tracker-card tr-1-card"></div>
              <div className="tracker-card tr-2-card"></div>
              <div className="tracker-card tr-3-card"></div>
              <div className="tracker-card tr-4-card"></div>
              <div className="tracker-card tr-5-card"></div>
              <div className="tracker-card tr-6-card"></div>
              <div className="tracker-card tr-7-card"></div>
              <div className="tracker-card tr-8-card"></div>
              <div className="tracker-card tr-9-card"></div>
              <div className="tracker-card tr-10-card"></div>
              <div className="tracker-card tr-11-card"></div>
              <div className="tracker-card tr-12-card"></div>
              <div className="tracker-card tr-13-card"></div>
              <div className="tracker-card tr-14-card"></div>
              <div className="tracker-card tr-15-card"></div>
              <div className="tracker-card tr-16-card"></div>
              <div className="tracker-card tr-17-card"></div>
              <div className="tracker-card tr-18-card"></div>
              <div className="tracker-card tr-19-card"></div>
              <div className="tracker-card tr-20-card"></div>
              <div className="tracker-card tr-21-card"></div>
              <div className="tracker-card tr-22-card"></div>
              <div className="tracker-card tr-23-card"></div>
              <div className="tracker-card tr-24-card"></div>
              <div className="tracker-card tr-25-card"></div>
              <div id="dashboard-card">
                <p id="dashboard-prompt">Start Practice</p>
                <div className="title-card">Practice<br/>Flashcards</div>
                <div className="subtitle-card">
                  Click to begin
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Dashboard;