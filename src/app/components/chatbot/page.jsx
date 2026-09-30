"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon, PlusIcon, CheckIcon } from '@heroicons/react/24/outline';
import gmkartLogo from '@/assets/images/logo.png';

const TEXT = {
  en: {
    languagePrompt: "Hi! Would you like to chat in English or Hindi?",
    greeting: "Great! Tell me what you're looking for and your budget, and I'll find and add products for you — or ask me about ordering, tracking, wallet, and more.",
    placeholder: 'e.g. chips under 50 rupees',
    hint: 'Press Enter to send, Shift + Enter for a new line.',
    loginNeeded: "You'll need to log in first — I've opened the login page for you.",
    error: 'Sorry, something went wrong. Please contact support@gmkart.com.',
    typingWords: ['Thinking', 'Looking that up', 'Checking products', 'Almost there'],
  },
  hi: {
    languagePrompt: "नमस्ते! आप अंग्रेज़ी या हिंदी में बात करना चाहेंगे?",
    greeting: "बढ़िया! बताइए आपको क्या चाहिए और आपका बजट क्या है — मैं आपके लिए प्रोडक्ट ढूंढकर कार्ट में जोड़ दूँगा। ऑर्डर, ट्रैकिंग या वॉलेट के बारे में भी पूछ सकते हैं।",
    placeholder: 'जैसे: 50 रुपये में चिप्स',
    hint: 'भेजने के लिए Enter दबाएँ, नई लाइन के लिए Shift + Enter।',
    loginNeeded: 'पहले लॉगिन करना होगा — मैंने लॉगिन पेज खोल दिया है।',
    error: 'माफ़ कीजिए, कुछ गड़बड़ हो गई। कृपया support@gmkart.com पर संपर्क करें।',
    typingWords: ['सोच रहा हूँ', 'ढूंढ रहा हूँ', 'प्रोडक्ट चेक कर रहा हूँ', 'बस हो गया'],
  },
};

const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'en' },
  { label: 'हिंदी', value: 'hi' },
];

const getLocation = () => {
  try {
    const data = JSON.parse(localStorage.getItem('userLocationData') || 'null');
    if (data?.latitude != null && data?.longitude != null) {
      return { latitude: data.latitude, longitude: data.longitude };
    }
  } catch {
    // ignore malformed saved location
  }
  return {};
};

const getSavedLanguage = () => {
  try {
    const saved = localStorage.getItem('gm_chat_lang');
    return saved === 'hi' || saved === 'en' ? saved : null;
  } catch {
    return null;
  }
};

const AssistantAvatar = () => (
  <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-brand-200">
    <Image src={gmkartLogo} alt="GMKart" className="h-6 w-6 object-contain" />
  </span>
);

const UserAvatar = () => (
  <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-xs font-bold text-brand-700">
    You
  </span>
);

const TypingBubble = ({ words }) => {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    setWordIndex(0);
    const id = setInterval(() => setWordIndex((i) => (i + 1) % words.length), 1500);
    return () => clearInterval(id);
  }, [words]);

  return (
    <div className="chat-fade-in flex items-start gap-2">
      <AssistantAvatar />
      <div className="flex items-center rounded-2xl rounded-tl-md bg-white border border-gray-200 px-3 py-2">
        <span
          key={wordIndex}
          className="chat-shimmer-text chat-fade-in bg-gradient-to-r from-gray-400 via-gray-600 to-gray-400 bg-clip-text text-sm font-medium text-transparent"
        >
          {words[wordIndex]}...
        </span>
      </div>
    </div>
  );
};

const ProductCard = ({ product, isLoggedIn, onLoginRequired }) => {
  const [status, setStatus] = useState('idle'); // idle | adding | added | error

  const handleAdd = async () => {
    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }
    setStatus('adding');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/proxy/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: product.id, quantity: 1, price: product.price }),
      });
      if (!res.ok) throw new Error('failed');
      setStatus('added');
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <div className="flex-shrink-0 w-32 bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="h-20 bg-gray-50 flex items-center justify-center p-1.5">
        <img
          src={product.image || 'https://via.placeholder.com/150?text=No+Image'}
          alt={product.name}
          className="max-h-full max-w-full object-contain"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
        />
      </div>
      <div className="p-2">
        <p className="text-[11px] font-semibold text-gray-800 leading-tight line-clamp-2 min-h-[2.2em]">
          {product.name}
        </p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs font-bold text-gray-900">₹{product.price}</span>
          <button
            onClick={handleAdd}
            disabled={status === 'adding' || status === 'added'}
            className="w-6 h-6 rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-70 flex items-center justify-center flex-shrink-0"
            aria-label="Add to cart"
          >
            {status === 'added' ? (
              <CheckIcon className="w-3.5 h-3.5 text-white" />
            ) : (
              <PlusIcon className="w-3.5 h-3.5 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ChatWidget = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const checkAuth = () => setIsLoggedIn(!!localStorage.getItem('token'));
    checkAuth();
    window.addEventListener('authChange', checkAuth);
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('authChange', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  // Open the widget: pick up a remembered language, or ask for one.
  useEffect(() => {
    if (!isOpen || messages.length > 0) return;
    const saved = getSavedLanguage();
    if (saved) {
      setLanguage(saved);
      setMessages([{ role: 'assistant', content: TEXT[saved].greeting }]);
    } else {
      setMessages([{ role: 'assistant', content: TEXT.en.languagePrompt, languageChoice: true }]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, loading]);

  useEffect(() => {
    if (isOpen && language) inputRef.current?.focus();
  }, [isOpen, language]);

  // Full-screen overlay: stop the page behind it from scrolling, and let Esc close it.
  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const t = TEXT[language || 'en'];

  const chooseLanguage = (lang) => {
    setLanguage(lang);
    try {
      localStorage.setItem('gm_chat_lang', lang);
    } catch {
      // storage blocked - language just won't be remembered next visit
    }
    setMessages([{ role: 'assistant', content: TEXT[lang].greeting }]);
  };

  const switchLanguage = () => {
    const next = language === 'hi' ? 'en' : 'hi';
    chooseLanguage(next);
  };

  const handleLoginRequired = () => {
    setMessages((prev) => [...prev, { role: 'assistant', content: t.loginNeeded }]);
    router.push('/login');
  };

  const sendText = async (text) => {
    const updatedMessages = [
      ...messages.filter((m) => !m.languageChoice).map(({ role, content }) => ({ role, content })),
      { role: 'user', content: text },
    ];
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const { latitude, longitude } = getLocation();

      const response = await fetch('/proxy/api/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ messages: updatedMessages, latitude, longitude, language }),
      });
      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.reply, products: data.products?.length ? data.products : undefined },
        ]);
        if (data.cartUpdated) {
          window.dispatchEvent(new CustomEvent('cartUpdated'));
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.message || t.error },
        ]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: t.error }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading || !language) return;
    sendText(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-50 w-14 h-14 bg-brand-600 hover:bg-brand-700 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
          aria-label="Open chat"
        >
          <ChatBubbleLeftRightIcon className="w-7 h-7 text-white" />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col">
          <header className="shrink-0 flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-3 sm:px-8">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white">
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-gray-900">GMKart Assistant</p>
                <p className="text-xs text-gray-500">Ask, search, and add to cart</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {language && (
                <button
                  onClick={switchLanguage}
                  className="text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-full px-3 py-1.5 transition-colors"
                  title="Switch language"
                >
                  {language === 'hi' ? 'EN' : 'हिं'}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                title="Close (Esc)"
                className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </header>

          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-8 bg-gray-50">
            <div className="mx-auto w-full max-w-2xl flex flex-col gap-5">
              {messages.map((msg, i) => (
                <div key={i} className="chat-fade-in flex flex-col gap-2">
                  {msg.role === 'user' ? (
                    <div className="flex items-start justify-end gap-3">
                      <p className="max-w-[78%] rounded-2xl rounded-tr-md bg-brand-600 text-white px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      <UserAvatar />
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <AssistantAvatar />
                      <p className="max-w-[78%] rounded-2xl rounded-tl-md bg-white border border-gray-200 text-gray-800 px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  )}

                  {msg.languageChoice && !language && (
                    <div className="chat-fade-in ml-11 flex flex-wrap gap-2">
                      {LANGUAGE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => chooseLanguage(option.value)}
                          className="rounded-full border border-brand-300 bg-white px-4 py-1.5 text-sm font-semibold text-brand-700 hover:border-brand-500 hover:bg-brand-50 transition-colors"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {msg.products && (
                    <div className="ml-11 flex gap-2.5 overflow-x-auto max-w-[calc(100%-2.75rem)] pb-1 no-scrollbar">
                      {msg.products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          isLoggedIn={isLoggedIn}
                          onLoginRequired={handleLoginRequired}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {loading && <TypingBubble words={t.typingWords} />}
            </div>
          </div>

          {language && (
            <div className="shrink-0 px-4 pt-2 pb-5">
              <div className="mx-auto w-full max-w-2xl">
                <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-white p-2 transition focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t.placeholder}
                    disabled={loading}
                    className="min-h-[44px] max-h-32 min-w-0 flex-1 resize-none bg-transparent px-2 py-2.5 text-base leading-relaxed text-gray-800 outline-none placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="w-10 h-10 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                    aria-label="Send"
                  >
                    <PaperAirplaneIcon className="w-4 h-4 text-white" />
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-gray-400 px-1">{t.hint}</p>
              </div>
            </div>
          )}

          <style jsx>{`
            .no-scrollbar {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
