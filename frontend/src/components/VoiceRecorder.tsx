import React, { useState } from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { analyzeContentWithGPT } from '../utils/analyzeContentWithGPT';
import supabase from '../api/supabase'; // Add this import

interface VoiceRecorderProps {
  onToneAnalysis?: (tone: string, features: any) => void;
  cardType: 'behavioral' | 'technical';
  questionText?: string; // Add this to track what question was asked
}

function VoiceRecorder({ onToneAnalysis, cardType, questionText }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [tone, setTone] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [gptFeedback, setGptFeedback] = useState<string>('');
  const [sessionSaved, setSessionSaved] = useState(false); // New state
  const [testResult, setTestResult] = useState<string>(''); // For test feedback

  // TEST FUNCTION - Add this to debug Supabase connection
  const testSupabaseConnection = async () => {
    console.log('Testing Supabase connection...');
    setTestResult('Testing connection...');
    
    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .insert({
          user_id: 'test-user-123',
          card_type: 'test',
          question_text: 'test question',
          duration_seconds: 30,
          status: 'completed'
        })
        .select()
        .single();
  
      console.log('Insert result:', { data, error });
      
      if (error) {
        console.error('Supabase error:', error);
        setTestResult(`❌ Error: ${error.message}`);
      } else {
        console.log('Success! Check your Supabase table.');
        setTestResult('✅ Test successful! Check your Supabase table.');
      }
    } catch (err) {
      console.error('Connection error:', err);
      setTestResult(`❌ Connection error: ${err}`);
    }
  };

  // Add function to save session to database
  const saveSessionToDatabase = async (sessionData: {
    transcript: string;
    sentiment?: string;
    gptFeedback: string;
    cardType: string;
    questionText?: string;
  }) => {
    try {
      console.log('Saving session to database...', sessionData);
      
      // Save main session
      const { data: session, error: sessionError } = await supabase
        .from('interview_sessions')
        .insert({
          user_id: 'temp-user', // We'll fix this when we add auth
          card_type: sessionData.cardType,
          question_text: sessionData.questionText,
          duration_seconds: 0, // We can calculate this later
          status: 'completed'
        })
        .select()
        .single();

      console.log('Session insert result:', { session, sessionError });

      if (sessionError) throw sessionError;

      // Save transcript
      const { error: transcriptError } = await supabase
        .from('transcripts')
        .insert({
          session_id: session.id,
          text: sessionData.transcript,
          confidence_score: 0.95 // Placeholder for now
        });

      console.log('Transcript insert result:', { transcriptError });

      if (transcriptError) throw transcriptError;

      // Save analysis results
      const { error: analysisError } = await supabase
        .from('voice_analysis')
        .insert({
          session_id: session.id,
          sentiment: sessionData.sentiment,
          gpt_feedback: sessionData.gptFeedback,
          analysis_data: {
            cardType: sessionData.cardType,
            timestamp: new Date().toISOString()
          }
        });

      console.log('Analysis insert result:', { analysisError });

      if (analysisError) throw analysisError;

      setSessionSaved(true);
      console.log('✅ Session saved successfully!');
    } catch (error) {
      console.error('❌ Error saving session:', error);
    }
  };

  const startRecording = () => {
    setTone(null);
    setFeedback('');
    setTranscript(null);
    setGptFeedback('');
    setSessionSaved(false); // Reset save status
    setTestResult(''); // Clear test result
    setIsRecording(true);
    setIsAnalyzing(true);

    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      import.meta.env.VITE_AZURE_SPEECH_KEY,
      import.meta.env.VITE_AZURE_SPEECH_REGION
    );
    speechConfig.speechRecognitionLanguage = "en-US";

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizeOnceAsync(async result => {
      setIsRecording(false);
      setIsAnalyzing(false);
      const transcript = result.text;
      setTranscript(transcript);
      console.log("Transcript:", transcript);

      let sentimentResult = null;
      let gptResult = '';

      if (cardType === 'behavioral') {
        // Azure Text Analytics sentiment analysis
        if (transcript) {
          try {
            const endpoint = import.meta.env.VITE_AZURE_TEXT_ANALYTICS_ENDPOINT;
            const cleanEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
            const url = `${cleanEndpoint}/text/analytics/v3.1/sentiment`;
            console.log('Text Analytics URL:', url);
            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'Ocp-Apim-Subscription-Key': import.meta.env.VITE_AZURE_TEXT_ANALYTICS_KEY,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                documents: [
                  {
                    id: '1',
                    language: 'en',
                    text: transcript
                  }
                ]
              })
            });
            const resultJson = await response.json();
            console.log("Sentiment analysis:", resultJson);
            const sentiment = resultJson.documents?.[0]?.sentiment;
            setTone(sentiment);
            sentimentResult = sentiment;
            onToneAnalysis?.(sentiment, resultJson.documents?.[0]);
          } catch (err) {
            console.error('Error analyzing sentiment:', err);
          }
        }
        // Also analyze content with GPT
        if (transcript) {
          gptResult = await analyzeContentWithGPT(transcript, 'behavioral');
          setGptFeedback(gptResult);
        }
      } else {
        // Technical: only analyze content with GPT
        if (transcript) {
          gptResult = await analyzeContentWithGPT(transcript, 'technical');
          setGptFeedback(gptResult);
        }
      }

      // Save everything to database
      if (transcript) {
        console.log('About to save session with data:', {
          transcript,
          sentiment: sentimentResult,
          gptFeedback: gptResult,
          cardType,
          questionText
        });
        
        await saveSessionToDatabase({
          transcript,
          sentiment: sentimentResult,
          gptFeedback: gptResult,
          cardType,
          questionText
        });
      }
    });
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      marginBottom: '2rem',
      minHeight: '300px'
    }}>
      <h2 style={{
        color: '#b73e3e',
        marginBottom: '1.5rem',
        textAlign: 'center',
        fontFamily: 'Varela Round, sans-serif'
      }}>
        Voice Recording
      </h2>

      {/* TEST BUTTON - Add this for debugging */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <button
          onClick={testSupabaseConnection}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.9rem',
            fontFamily: 'Varela Round, sans-serif',
            cursor: 'pointer',
            marginRight: '0.5rem'
          }}
        >
          🧪 Test Database Connection
        </button>
      </div>

      {/* Show test result */}
      {testResult && (
        <div style={{
          backgroundColor: testResult.includes('✅') ? '#d4edda' : '#f8d7da',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          textAlign: 'center',
          fontSize: '0.9rem'
        }}>
          {testResult}
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <button
          onClick={startRecording}
          style={{
            padding: '1rem 2rem',
            backgroundColor: isRecording ? '#dc3545' : '#b73e3e',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontFamily: 'Varela Round, sans-serif',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          disabled={isRecording}
        >
          {isRecording ? 'Listening...' : 'Start Recording'}
        </button>
      </div>

      {isAnalyzing && (
        <div style={{ textAlign: 'center', color: '#666' }}>
          Analyzing...
        </div>
      )}

      {/* Add save status indicator */}
      {sessionSaved && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: '#d4edda',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            textAlign: 'center'
          }}
        >
          <span style={{ color: '#155724', fontSize: '0.9rem' }}>
            ✅ Session saved successfully!
          </span>
        </motion.div>
      )}

      {transcript && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: '#e3f2fd',
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '1rem'
          }}
        >
          <h3 style={{
            color: '#1565c0',
            marginBottom: '0.5rem',
            fontFamily: 'Varela Round, sans-serif'
          }}>
            Transcript
          </h3>
          <p style={{ color: '#666', margin: 0 }}>
            {transcript}
          </p>
        </motion.div>
      )}
      
      {tone && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: '#fff3cd',
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '1rem'
          }}
        >
          <h3 style={{
            color: '#856404',
            marginBottom: '0.5rem',
            fontFamily: 'Varela Round, sans-serif'
          }}>
            Sentiment
          </h3>
          <p style={{ color: '#666', margin: 0 }}>
            {tone}
          </p>
        </motion.div>
      )}
      
      {gptFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: '#e8f5e9',
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '1rem'
          }}
        >
          <h3 style={{
            color: '#2e7d32',
            marginBottom: '0.5rem',
            fontFamily: 'Varela Round, sans-serif'
          }}>
            AI Feedback
          </h3>
          <p style={{ color: '#666', margin: 0 }}>
            {gptFeedback}
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default VoiceRecorder;