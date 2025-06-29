import { motion } from 'framer-motion';

function About() {
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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
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
        <p style={{ fontSize: '1.2rem', marginTop: '1rem' }}>
          Coming soon: AI-powered interview simulations, personalized study recommendations, and collaborative practice sessions with peers. Join us in revolutionizing how we prepare for interviews.
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
    </motion.div>
  );
}

export default About;