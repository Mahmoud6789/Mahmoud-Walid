import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Clock, Activity, Volume2, StopCircle, RotateCcw, Pause } from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";
import { Exercise, vibrate } from '../App';

interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  exercise: Exercise;
  t: any;
  lang: string;
}

export const ExerciseModal: React.FC<ExerciseModalProps> = ({ isOpen, onClose, onComplete, exercise, t, lang }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [initialDuration, setInitialDuration] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Parse duration string to seconds (e.g., "5 Mins" -> 300)
  useEffect(() => {
    if (exercise) {
        const parts = exercise.duration.split(' ');
        const mins = parseInt(parts[0]);
        const seconds = !isNaN(mins) ? mins * 60 : 300; // Default 5 mins if parse fails
        setInitialDuration(seconds);
        setTimeLeft(seconds);
    }
  }, [exercise]);

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setIsTimerRunning(false);
      stopTTS();
    }
  }, [isOpen]);

  // Timer Interval
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timeLeft > 0) {
        interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
        setIsTimerRunning(false);
        vibrate([200, 100, 200]);
        // Could play a beep sound here
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  // Programmatic play when switching to video mode
  useEffect(() => {
    if (isPlaying && videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Video autoplay failed:", error);
      });
    }
  }, [isPlaying]);

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
    vibrate(30);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(initialDuration);
    vibrate(30);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Construct instructions text based on current exercise steps for TTS
  const instructionsText = `${exercise.title}. ${exercise.steps.join('. ')}`;

  // Helper: Convert Base64 to Raw PCM (Int16) -> AudioBuffer (Float32)
  const playRawAudio = (base64String: string) => {
    try {
      // 1. Initialize Audio Context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass({ sampleRate: 24000 }); // Model output is 24kHz
      audioContextRef.current = ctx;

      // 2. Decode Base64 to Binary
      const binaryString = atob(base64String);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // 3. Convert Bytes to Int16 PCM
      const pcmData = new Int16Array(bytes.buffer);

      // 4. Create AudioBuffer (Float32) for the Browser
      const audioBuffer = ctx.createBuffer(1, pcmData.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      
      // Normalize Int16 (-32768 to 32767) to Float32 (-1.0 to 1.0)
      for (let i = 0; i < pcmData.length; i++) {
        channelData[i] = pcmData[i] / 32768.0;
      }

      // 5. Play Audio
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsSpeaking(false);
      source.start();
      sourceRef.current = source;
    } catch (e) {
      console.error("Audio Decoding Error:", e);
      setIsSpeaking(false);
    }
  };

  // 5. Generate Speech (TTS)
  const handleTTS = async () => {
    if (isSpeaking) {
        stopTTS();
        return;
    }
    setIsSpeaking(true);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: instructionsText }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
                }
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            playRawAudio(base64Audio);
        } else {
            console.warn("No audio data received");
            setIsSpeaking(false);
        }
    } catch (e) {
        console.error("TTS API Error", e);
        setIsSpeaking(false);
    }
  };

  const stopTTS = () => {
    if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current = null;
    }
    if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
    }
    setIsSpeaking(false);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col animate-slide-up transition-colors duration-300">
      {/* Header */}
      <div className="p-4 pt-12 pb-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t.todayExercise}</h2>
        <button 
          onClick={onClose} 
          className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-6 space-y-6">
          
          {/* Video Player */}
          <div className="w-full aspect-video bg-gray-900 rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-lg">
            {isPlaying ? (
              <video 
                ref={videoRef}
                src={exercise.videoUrl}
                className="w-full h-full object-cover rounded-2xl"
                controls
                playsInline
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <>
                {/* Thumbnail pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>
                <img 
                    src={exercise.thumbnailUrl} 
                    alt="Exercise Thumbnail" 
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                
                <button 
                  onClick={() => setIsPlaying(true)}
                  className="relative w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/50 group-hover:scale-110 transition-transform duration-300 z-10"
                >
                  <Play className="w-7 h-7 text-white fill-white ml-1" />
                </button>
                <span className="absolute bottom-3 right-3 text-white text-xs font-medium bg-black/60 px-2 py-1 rounded-md z-10">{exercise.duration}</span>
              </>
            )}
          </div>

          {/* Timer Section */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 flex items-center justify-between shadow-inner">
             <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">{t.timeLabel}</span>
                <span className={`text-3xl font-mono font-bold ${timeLeft === 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                    {timeLeft === 0 ? t.timerFinished : formatTime(timeLeft)}
                </span>
             </div>
             <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button 
                    onClick={toggleTimer}
                    disabled={timeLeft === 0}
                    className={`p-3 rounded-full shadow-md transition-all active:scale-95 ${
                        isTimerRunning 
                        ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/60' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700'
                    }`}
                >
                    {isTimerRunning ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                </button>
                <button 
                    onClick={resetTimer}
                    className="p-3 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-all active:scale-95"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>
             </div>
          </div>

          {/* Title & Stats */}
          <div>
            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full uppercase tracking-wider mb-2 inline-block">{exercise.category}</span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-start">{exercise.title}</h1>
            
            <div className="flex space-x-6 rtl:space-x-reverse text-sm text-gray-500 dark:text-gray-400 border-t border-b border-gray-100 dark:border-gray-800 py-3">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>{exercise.duration}</span>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Activity className="w-4 h-4 text-green-500" />
                <span>{exercise.intensity}</span>
              </div>
            </div>

            {/* Exercise Description */}
            <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm leading-relaxed text-start">
               {exercise.description}
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{t.instructionsTitle}</h3>
                <button 
                    onClick={handleTTS}
                    className={`flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isSpeaking ? 'bg-red-100 text-red-600' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'}`}
                >
                    {isSpeaking ? <StopCircle className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isSpeaking ? t.stop : t.listen}</span>
                </button>
              </div>
              <div className="space-y-4">
                {exercise.steps.map((step, index) => (
                    <div key={index} className="flex space-x-3 rtl:space-x-reverse">
                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{index + 1}</div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed text-start">{step}</p>
                    </div>
                ))}
              </div>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] transition-colors duration-300">
        <button 
          onClick={onComplete}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center space-x-2 rtl:space-x-reverse"
        >
          <span>{t.completeButton}</span>
        </button>
      </div>
    </div>
  );
};