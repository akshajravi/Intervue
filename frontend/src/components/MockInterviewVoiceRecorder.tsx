import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, Square, Send } from 'lucide-react';
import type { VoiceRecording } from '../types/interview';

interface MockInterviewVoiceRecorderProps {
  onRecordingComplete: (recording: VoiceRecording) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  disabled?: boolean;
}

const MockInterviewVoiceRecorder: React.FC<MockInterviewVoiceRecorderProps> = ({
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Request microphone permission on component mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasPermission(true);
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        setHasPermission(false);
        setError('Microphone access denied. Please enable microphone permissions.');
      }
    };

    checkPermission();
  }, []);

  // Start recording
  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedUrl(url);
        
        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      onRecordingStart?.();

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      setError('Failed to start recording. Please check your microphone.');
      console.error('Recording error:', err);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      onRecordingStop?.();
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  // Play recorded audio
  const playRecording = () => {
    if (recordedUrl && audioRef.current) {
      audioRef.current.src = recordedUrl;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Pause playback
  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Clear recording
  const clearRecording = () => {
    setRecordedBlob(null);
    setRecordedUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
    
    if (audioRef.current) {
      audioRef.current.src = '';
    }
  };

  // Submit recording
  const submitRecording = () => {
    if (recordedBlob && recordedUrl) {
      const recording: VoiceRecording = {
        blob: recordedBlob,
        url: recordedUrl,
        duration: recordingTime,
      };
      onRecordingComplete(recording);
      clearRecording();
    }
  };

  // Format recording time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => setIsPlaying(false);
      const handlePause = () => setIsPlaying(false);
      
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('pause', handlePause);
      
      return () => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('pause', handlePause);
      };
    }
  }, [recordedUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
    };
  }, [recordedUrl]);

  if (hasPermission === null) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-secondary-500 text-sm">Checking microphone permissions...</div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
        <div className="text-danger-700 text-sm font-medium mb-2">Microphone Access Required</div>
        <div className="text-danger-600 text-sm">
          Please enable microphone permissions to use voice recording.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-secondary-200 rounded-lg p-4 space-y-4">
      <audio ref={audioRef} style={{ display: 'none' }} />
      
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-danger-50 border border-danger-200 rounded-md">
          <div className="text-danger-700 text-sm">{error}</div>
        </div>
      )}

      {/* Recording Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isRecording && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-danger rounded-full animate-pulse" />
              <span className="text-sm font-medium text-danger">Recording...</span>
            </div>
          )}
          
          {recordedBlob && !isRecording && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full" />
              <span className="text-sm font-medium text-success">Recording ready</span>
            </div>
          )}
        </div>
        
        {/* Recording Timer */}
        {(isRecording || recordedBlob) && (
          <div className="text-sm font-mono text-secondary-700">
            {formatTime(recordingTime)}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-3">
        {!isRecording && !recordedBlob && (
          <button
            onClick={startRecording}
            disabled={disabled}
            className="btn btn-primary"
            aria-label="Start recording"
          >
            <Mic className="w-4 h-4" />
            Start Recording
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="btn btn-danger"
            aria-label="Stop recording"
          >
            <Square className="w-4 h-4" />
            Stop Recording
          </button>
        )}

        {recordedBlob && !isRecording && (
          <>
            <button
              onClick={isPlaying ? pausePlayback : playRecording}
              className="btn btn-secondary"
              aria-label={isPlaying ? 'Pause playback' : 'Play recording'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            
            <button
              onClick={clearRecording}
              className="btn btn-secondary"
              aria-label="Clear recording"
            >
              <MicOff className="w-4 h-4" />
              Clear
            </button>
            
            <button
              onClick={submitRecording}
              className="btn btn-success"
              aria-label="Submit recording"
            >
              <Send className="w-4 h-4" />
              Submit
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MockInterviewVoiceRecorder;