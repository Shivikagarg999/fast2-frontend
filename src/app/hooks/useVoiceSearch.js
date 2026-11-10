"use client";
import { useState, useRef, useCallback, useEffect } from 'react';

// Browser-native Web Speech API — no backend/API key involved. Supported in
// Chrome, Edge and Safari; absent in Firefox, so isSupported lets callers
// just hide the mic button there instead of showing a broken one.
export default function useVoiceSearch({ onResult, lang = 'en-IN' } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    setIsSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) onResult?.(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [lang, onResult]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { isSupported, isListening, startListening, stopListening };
}
