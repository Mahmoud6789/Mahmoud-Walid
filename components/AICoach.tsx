import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Mic, X, Send, Sparkles, MicOff, AlertCircle } from 'lucide-react';
import { FunctionDeclaration, GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";
import { Exercise, vibrate } from '../App';

interface AICoachProps {
    t: any;
    lang: string;
    exercises: Exercise[];
    onOpenExercise: (exercise: Exercise) => void;
    externalTrigger?: string | null;
    onClearTrigger?: () => void;
}

// Helper for audio encoding/decoding
function base64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const AICoach: React.FC<AICoachProps> = ({ t, lang, exercises, onOpenExercise, externalTrigger, onClearTrigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Gemini SDK
  const apiKey = process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);

  // --- TOOL DEFINITIONS ---
  const exerciseIds = exercises.map(e => e.id);
  
  const startExerciseTool: FunctionDeclaration = {
    name: 'startExercise',
    description: 'Opens the specific exercise modal for the user to start working out.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        exerciseId: {
          type: Type.STRING,
          description: `The ID of the exercise to start. Available IDs: ${exerciseIds.join(', ')}`,
          enum: exerciseIds
        }
      },
      required: ['exerciseId']
    }
  };

  const tools = [{ functionDeclarations: [startExerciseTool] }];

  const handleToolCall = (name: string, args: any): string => {
      console.log(`Tool Call: ${name}`, args);
      if (name === 'startExercise') {
          const ex = exercises.find(e => e.id === args.exerciseId);
          if (ex) {
              onOpenExercise(ex);
              vibrate([50, 50, 50]);
              // Close AI modal so user can see exercise? Optional. 
              // We'll keep it open but maybe shrink it or user manually closes. 
              // Actually, creating a better UX:
              setIsOpen(false); 
              return `Success. I have opened the ${ex.title} exercise for the user.`;
          }
          return `Error. Exercise ID ${args.exerciseId} not found.`;
      }
      return 'Error. Unknown function.';
  };

  // External Trigger Handling
  useEffect(() => {
    if (externalTrigger) {
        setIsOpen(true);
        setMessages(prev => [...prev, { role: 'model', text: externalTrigger }]);
        vibrate([100, 50, 100]); 
        if (onClearTrigger) onClearTrigger();
    }
  }, [externalTrigger, onClearTrigger]);

  // Greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'model', text: t.greeting }]);
    }
  }, [isOpen, t.greeting]);

  // Cleanup
  useEffect(() => {
    return () => {
      disconnectLive();
    };
  }, []);

  const disconnectLive = () => {
    // Close session if promise resolved
    if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => {
            try { session.close(); } catch(e) { console.log('Session already closed'); }
        });
        sessionPromiseRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
    }

    if (inputContextRef.current) {
        inputContextRef.current.close();
        inputContextRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsLiveConnected(false);
    setMode('text');
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const userMsg = inputText;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputText('');
    setIsLoading(true);
    setErrorMsg(null);
    vibrate(30);

    try {
      // 1. Send Message with Tools
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
            { role: 'user', parts: [{ text: `You are G-Back AI. Language: ${lang}. Available exercises: ${exercises.map(e => `${e.title} (ID: ${e.id})`).join(', ')}. If user wants to do an exercise, call startExercise.` }] },
            ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
            { role: 'user', parts: [{ text: userMsg }] }
        ],
        config: {
            tools: tools
        }
      });

      // 2. Handle Function Calls
      const functionCalls = response.candidates?.[0]?.content?.parts?.[0]?.functionCall 
         ? [response.candidates[0].content.parts[0].functionCall] // Single call structure
         : response.functionCalls; // Array structure

      let finalResponseText = response.text || "";

      if (functionCalls && functionCalls.length > 0) {
          // We only support single turn function calling for this prototype simplicity
          const call = functionCalls[0];
          const result = handleToolCall(call.name, call.args);
          
          // Send result back to model to get final confirmation text
          const followUp = await ai.models.generateContent({
              model: 'gemini-3-pro-preview',
              contents: [
                  { role: 'user', parts: [{ text: `System: Tool ${call.name} executed. Result: ${result}. Confirm to user.` }] }
              ]
          });
          finalResponseText = followUp.text || "Starting that for you now!";
      }

      setMessages(prev => [...prev, { role: 'model', text: finalResponseText }]);
      vibrate(50);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: t.connectionLost }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLiveMode = async () => {
    vibrate(50);
    if (isLiveConnected) {
        disconnectLive();
        return;
    }

    setMode('voice');
    setErrorMsg(null);

    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass({ sampleRate: 24000 });
        audioContextRef.current = ctx;
        nextStartTimeRef.current = ctx.currentTime;

        // Request Microphone
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            
            // Input processing
            const inputCtx = new AudioContextClass({ sampleRate: 16000 });
            inputContextRef.current = inputCtx;
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = scriptProcessor;
            
            scriptProcessor.onaudioprocess = (e) => {
                if (sessionPromiseRef.current) {
                    const inputData = e.inputBuffer.getChannelData(0);
                    const l = inputData.length;
                    const int16 = new Int16Array(l);
                    for (let i = 0; i < l; i++) {
                        int16[i] = inputData[i] * 32768;
                    }
                    const b64 = arrayBufferToBase64(int16.buffer);
                    
                    sessionPromiseRef.current.then(session => {
                        try {
                            session.sendRealtimeInput({
                                media: {
                                    mimeType: 'audio/pcm;rate=16000',
                                    data: b64
                                }
                            });
                        } catch (err) {
                            console.error("Send Error", err);
                        }
                    });
                }
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
            
        } catch (permError) {
            console.error("Mic Permission Error:", permError);
            setErrorMsg(t.micError);
            setMode('text');
            return;
        }

        // Connect to Gemini Live
        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO], 
                tools: tools, // Enable tools for Live API
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
                },
                systemInstruction: `You are an encouraging PT coach. Speak in ${lang === 'ar' ? 'Arabic' : 'English'}. Keep responses short. Available exercises: ${exercises.map(e => `${e.title} (ID: ${e.id})`).join(', ')}. Call startExercise if user wants to workout.`,
            },
            callbacks: {
                onopen: () => {
                  console.log("Live Connected");
                  setIsLiveConnected(true);
                  vibrate([30, 30]);
                },
                onmessage: (msg: LiveServerMessage) => {
                    // 1. Handle Tool Calls
                    if (msg.toolCall) {
                        for (const fc of msg.toolCall.functionCalls) {
                            const result = handleToolCall(fc.name, fc.args);
                            sessionPromiseRef.current?.then(session => {
                                session.sendToolResponse({
                                    functionResponses: {
                                        id: fc.id,
                                        name: fc.name,
                                        response: { result: result }
                                    }
                                });
                            });
                        }
                    }

                    // 2. Handle Audio
                    const data = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (data && audioContextRef.current) {
                        const bytes = base64ToUint8Array(data);
                        const int16Array = new Int16Array(bytes.buffer);
                        const float32 = new Float32Array(int16Array.length);
                        for(let i=0; i<int16Array.length; i++) {
                            float32[i] = int16Array[i] / 32768.0;
                        }

                        const buffer = audioContextRef.current.createBuffer(1, float32.length, 24000);
                        buffer.getChannelData(0).set(float32);
                        
                        const src = audioContextRef.current.createBufferSource();
                        src.buffer = buffer;
                        src.connect(audioContextRef.current.destination);
                        
                        const now = audioContextRef.current.currentTime;
                        const start = Math.max(now, nextStartTimeRef.current);
                        src.start(start);
                        nextStartTimeRef.current = start + buffer.duration;
                    }
                },
                onclose: () => {
                    console.log("Live Closed");
                    setIsLiveConnected(false);
                },
                onerror: (e) => {
                    console.error("Live API Error", e);
                    setErrorMsg("Connection Error");
                }
            }
        });
        
        sessionPromiseRef.current = sessionPromise;
        
    } catch (err) {
        console.error("Live API Setup Error:", err);
        disconnectLive();
        setErrorMsg(t.connectionLost);
    }
  };

  return (
    <>
      {/* FAB */}
      <button 
        onClick={() => { setIsOpen(true); vibrate(30); }}
        className={`fixed bottom-24 right-6 rtl:right-auto rtl:left-6 w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full shadow-lg shadow-blue-300 dark:shadow-blue-900/40 flex items-center justify-center z-40 transition-transform hover:scale-105 active:scale-95 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <Sparkles className="w-7 h-7 text-white" />
      </button>

      {/* Overlay Interface */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-end justify-center sm:items-center p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-[350px] h-[500px] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up transition-colors duration-300">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-sm">{t.coachHeader}</h3>
                    <p className="text-[10px] opacity-80">{t.poweredBy}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-gray-950 relative transition-colors duration-300">
              {errorMsg && (
                 <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 p-3 rounded-lg text-xs flex items-start space-x-2 rtl:space-x-reverse">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                 </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none rtl:rounded-tr-2xl rtl:rounded-tl-none' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 shadow-sm rounded-tl-none rtl:rounded-tl-2xl rtl:rounded-tr-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                  <div className="flex justify-start">
                      <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm">
                          <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75"></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></div>
                          </div>
                      </div>
                  </div>
              )}
              
              {/* Voice Mode Visualizer Overlay */}
              {mode === 'voice' && !errorMsg && (
                  <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm flex flex-col items-center justify-center z-10 space-y-6 transition-colors">
                      <div className="relative">
                          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center animate-pulse">
                              <Mic className="w-10 h-10 text-red-500" />
                          </div>
                          <div className="absolute -inset-4 border-2 border-red-100 dark:border-red-900/30 rounded-full animate-ping opacity-20"></div>
                      </div>
                      <div className="text-center">
                          <h3 className="font-bold text-gray-900 dark:text-white">{t.voiceMode}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{isLiveConnected ? t.listening : t.connecting}</p>
                      </div>
                      <button 
                        onClick={disconnectLive}
                        className="px-6 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                          {t.endSession}
                      </button>
                  </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center space-x-2 rtl:space-x-reverse shrink-0 transition-colors">
               <button 
                 onClick={toggleLiveMode}
                 className={`p-3 rounded-full transition-colors ${isLiveConnected ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
               >
                 {isLiveConnected ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
               </button>
               <div className="flex-1 relative">
                 <input 
                   type="text" 
                   value={inputText}
                   onChange={(e) => setInputText(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                   placeholder={t.askPlaceholder} 
                   className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-full py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                   disabled={mode === 'voice'}
                 />
               </div>
               <button 
                 onClick={handleSendMessage}
                 disabled={!inputText.trim() || mode === 'voice'}
                 className="p-3 bg-blue-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transform rtl:rotate-180"
               >
                 <Send className="w-4 h-4" />
               </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};