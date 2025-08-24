import React, { useState, useRef, useCallback } from 'react';
import { Mic, Square, Play, Pause, Trash2, Upload } from 'lucide-react';
import axios from 'axios';

const VoiceRecorder = ({ 
  onUploadSuccess, 
  onUploadError, 
  endpoint,
  className = '' 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      startTimer();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      onUploadError?.('Unable to access microphone');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopTimer();
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimer();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      stopTimer();
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
  };

  const uploadVoiceNote = async () => {
    if (!audioBlob) return;

    const formData = new FormData();
    formData.append('voiceNote', audioBlob, 'recording.webm');
    formData.append('duration', recordingTime);

    try {
      setIsUploading(true);
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': localStorage.getItem('token')
        }
      });

      onUploadSuccess?.(response.data);
      deleteRecording(); // Clear the recording after successful upload
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError?.(error.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Voice Note</h3>
        <div className="text-sm text-gray-500">
          {formatTime(recordingTime)}
        </div>
      </div>

      {/* Recording Controls */}
      {!audioBlob && (
        <div className="flex items-center justify-center space-x-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Mic className="w-5 h-5" />
              <span>Start Recording</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              {!isPaused ? (
                <button
                  onClick={pauseRecording}
                  className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Pause className="w-5 h-5" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={resumeRecording}
                  className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Play className="w-5 h-5" />
                  <span>Resume</span>
                </button>
              )}
              <button
                onClick={stopRecording}
                className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Square className="w-5 h-5" />
                <span>Stop</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="flex items-center justify-center mt-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`}></div>
            <span className="text-sm text-gray-600">
              {isPaused ? 'Recording paused' : 'Recording...'}
            </span>
          </div>
        </div>
      )}

      {/* Playback and Upload Controls */}
      {audioBlob && (
        <div className="space-y-4">
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
          
          <div className="flex items-center justify-center space-x-2">
            {!isPlaying ? (
              <button
                onClick={playAudio}
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Play className="w-5 h-5" />
                <span>Play</span>
              </button>
            ) : (
              <button
                onClick={pauseAudio}
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </button>
            )}
            
            <button
              onClick={deleteRecording}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete</span>
            </button>
          </div>

          <button
            onClick={uploadVoiceNote}
            disabled={isUploading}
            className="w-full flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Upload className="w-5 h-5" />
            )}
            <span>{isUploading ? 'Uploading...' : 'Upload Voice Note'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
