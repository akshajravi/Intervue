import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function About() {
  const navigate = useNavigate();

  const handleTryMockInterview = () => {
    navigate('/mock-interview-app');
  };

  const handleTryFlashcards = () => {
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
        padding: '4rem 2rem',
        backgroundColor: '#fff7f1',
        color: '#212529',
        fontFamily: 'Varela Round, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Main About Section */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '4rem'
        }}>
          {/* Text Block */}
          <div style={{ maxWidth: '800px', textAlign: 'left', marginRight: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: '#b73e3e' }}>About Intervue</h1>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.7' }}>
              Welcome to Intervue - your modern companion for mastering interviews and technical concepts through interactive flashcards.
            </p>
            <p style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>
              We've reimagined the traditional flashcard experience with a focus on interview preparation. Our platform combines the science of spaced repetition with a beautiful, intuitive interface that makes learning enjoyable.
            </p>
            <p style={{ fontSize: '1.2rem', marginTop: '1rem' }}>
              Whether you're preparing for behavioral interviews, technical assessments, or system design discussions, Intervue provides curated flashcard sets that cover the most important topics you need to know.
            </p>
          </div>

          {/* Image Block */}
          <div>
            <img
              src="/images/image2.png"
              alt="Interview Preparation Illustration"
              style={{ maxWidth: '400px', width: '100%', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
            />
          </div>
        </div>

        {/* AI Mock Interview Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '3rem',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
          border: '2px solid #b73e3e',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            fontSize: '2rem', 
            marginBottom: '1.5rem', 
            color: '#b73e3e',
            fontWeight: 'bold'
          }}>
            AI-Powered Mock Interviews
          </h2>
          
          <p style={{ 
            fontSize: '1.3rem', 
            lineHeight: '1.6', 
            marginBottom: '2rem',
            color: '#333',
            maxWidth: '800px',
            margin: '0 auto 2rem auto'
          }}>
            Experience realistic interview simulations with our advanced AI interviewer. Practice coding challenges, 
            system design questions, and behavioral interviews in a supportive environment that adapts to your skill level.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem'
          }}>
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <h3 style={{ color: '#b73e3e', marginBottom: '0.75rem', fontSize: '1.3rem' }}>Live Code Editor</h3>
              <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.5' }}>Write and test code in real-time with syntax highlighting and multiple language support</p>
            </div>
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <h3 style={{ color: '#b73e3e', marginBottom: '0.75rem', fontSize: '1.3rem' }}>Voice Interaction</h3>
              <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.5' }}>Practice explaining your solutions out loud with voice recording capabilities</p>
            </div>
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <h3 style={{ color: '#b73e3e', marginBottom: '0.75rem', fontSize: '1.3rem' }}>Real-time Feedback</h3>
              <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.5' }}>Get instant guidance and intelligent follow-up questions from our AI interviewer</p>
            </div>
          </div>

          <button
            onClick={handleTryMockInterview}
            style={{
              backgroundColor: '#b73e3e',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '12px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 8px rgba(183, 62, 62, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#a03636';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#b73e3e';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Try AI Mock Interview
          </button>
        </div>

        {/* Flashcards Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '3rem',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
          border: '2px solid #4a90e2',
          textAlign: 'center',
          marginTop: '3rem'
        }}>
          <h2 style={{ 
            fontSize: '2rem', 
            marginBottom: '1.5rem', 
            color: '#4a90e2',
            fontWeight: 'bold'
          }}>
            Interactive Flashcard System
          </h2>
          
          <p style={{ 
            fontSize: '1.3rem', 
            lineHeight: '1.6', 
            marginBottom: '2rem',
            color: '#333',
            maxWidth: '800px',
            margin: '0 auto 2rem auto'
          }}>
            Master interview concepts with our scientifically-designed flashcard system. Create custom sets, 
            use AI-generated cards, or practice with curated collections covering technical and behavioral topics.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem'
          }}>
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <h3 style={{ color: '#4a90e2', marginBottom: '0.75rem', fontSize: '1.3rem' }}>Spaced Repetition</h3>
              <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.5' }}>Learn efficiently with scientifically-proven study methods that optimize retention</p>
            </div>
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <h3 style={{ color: '#4a90e2', marginBottom: '0.75rem', fontSize: '1.3rem' }}>AI Generation</h3>
              <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.5' }}>Generate personalized flashcards from any topic using advanced AI technology</p>
            </div>
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <h3 style={{ color: '#4a90e2', marginBottom: '0.75rem', fontSize: '1.3rem' }}>Custom Sets</h3>
              <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.5' }}>Create and organize your own flashcard collections tailored to your needs</p>
            </div>
          </div>

          <button
            onClick={handleTryFlashcards}
            style={{
              backgroundColor: '#4a90e2',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '12px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 8px rgba(74, 144, 226, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#357abd';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#4a90e2';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Explore Flashcards
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default About;