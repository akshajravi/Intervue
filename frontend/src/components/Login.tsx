import { motion } from 'framer-motion';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase.ts';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Logged in as:', user.displayName);
      // Optionally store user info or navigate
      navigate('/dashboard'); // Create this page later
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      alert('Login failed. Please try again.');
    }
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
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: '1.5rem',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <h1>Welcome to Intervue</h1>
      <p>Sign in to save your progress and access your flashcards.</p>
      <button className="red-button" onClick={handleGoogleLogin}>
        Sign in
      </button>
    </motion.div>
  );
}

export default Login;