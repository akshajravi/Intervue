import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function Landing() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      style={{
        minHeight: '80vh',
        padding: '2rem',
        gap: '2rem',
        backgroundColor: '#fff7f1',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Image Section */}
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <img
          src="/images/image.png"
          alt="Person flipping flashcards"
          style={{
            maxWidth: '400px',
            width: '100%',
            height: 'auto',
          }}
        />
      </div>

      {/* Text Section */}
      <div
        style={{
          maxWidth: '500px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center'
        }}
      >
        <h1>Welcome to Intervue</h1>
        <p>
          A simple, powerful tool to help you ace interviews.
        </p>
        <p>
          Intervue makes it easy to practice, reflect, and improve, all in one place
        </p>
        <Link 
          to="/login" 
          className="red-button"
        >
          Get Started
        </Link>
      </div>
    </motion.div>
  );
}

export default Landing;