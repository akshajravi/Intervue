import React, { useState } from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { analyzeContentWithGPT } from '../utils/analyzeContentWithGPT';

interface VoiceRecorderProps {
  onToneAnalysis?: (tone: string, features: any) => void;
  cardType: 'behavioral' | 'technical';
}

function VoiceRecorder({ onToneAnalysis, cardType }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [tone, setTone] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [gptFeedback, setGptFeedback] = useState<string>('');

  console.log('Azure Speech Key:', import.meta.env.VITE_AZURE_SPEECH_KEY);
  console.log('Azure Speech Region:', import.meta.env.VITE_AZURE_SPEECH_REGION);

  const startRecording = () => {
    setTone(null);
    setFeedback('');
    setTranscript(null);
    setGptFeedback('');
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
            onToneAnalysis?.(sentiment, resultJson.documents?.[0]);
          } catch (err) {
            console.error('Error analyzing sentiment:', err);
          }
        }
        // Also analyze content with GPT
        if (transcript) {
          const gptResult = await analyzeContentWithGPT(transcript, 'behavioral');
          setGptFeedback(gptResult);
        }
      } else {
        // Technical: only analyze content with GPT
        if (transcript) {
          const gptResult = await analyzeContentWithGPT(transcript, 'technical');
          setGptFeedback(gptResult);
        }
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