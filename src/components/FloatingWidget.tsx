import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from './LanguageContext';
import { useAppTheme } from './ThemeContext';
import { Sparkles, MessageSquare, HelpCircle, X, ChevronRight, Calendar, User, Mail, Phone, Globe, ChevronDown, Send, UserCheck, Shield, AlertCircle, ArrowLeft, Star, Volume2, ShieldAlert } from 'lucide-react';

interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'AGENT';
  content: string;
  confidence?: number;
  citationSource?: string;
  createdAt: string;
}

export default function FloatingWidget() {
  const { translate, activeLanguage } = useLanguage();
  const { activeTheme } = useAppTheme();

  // Launcher positioning toggle
  const [isOpen, setIsOpen] = useState(false);
  const [sessionCreated, setSessionCreated] = useState(false);
  const [sessionId] = useState(() => {
    const cached = sessionStorage.getItem('enrollai_session_id');
    if (cached) return cached;
    const fresh = `session_${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem('enrollai_session_id', fresh);
    return fresh;
  });

  // Dynamic config loaded from Express server
  const [widgetConfig, setWidgetConfig] = useState({
    botName: 'EnrollBot',
    welcomeMessage: 'Hello! Welcome to Horizon University! How can I help you find the right program today? 🎓',
    leadCaptureEnabled: true,
    bookingEnabled: true,
    humanHandoffEnabled: true,
    confidenceDisplayEnabled: true,
    whatsappEnabled: true,
    whatsappNumber: '+237 690 000 000',
    timeTriggerEnabled: true,
    timeTriggerDelay: 6, // fast pop in sandbox
    scrollTriggerEnabled: true,
    scrollTriggerPercent: 50,
    exitIntentEnabled: true,
    idleTriggerEnabled: true,
    position: 'right_bottom',
    launcherEmoji: '🎓',
    pulseEnabled: true,
  });

  // Current interface panel: 'slides' | 'lead_form' | 'scheduler' | 'chat'
  const [activePanel, setActivePanel] = useState<'slides' | 'lead_form' | 'scheduler' | 'chat'>('slides');
  const [slideIndex, setSlideIndex] = useState(0);

  // Forms state variables
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadCountry, setLeadCountry] = useState('Cameroon');
  const [leadCity, setLeadCity] = useState('');
  const [leadProgram, setLeadProgram] = useState('Executive MBA (EN/FR)');
  const [leadDate, setLeadDate] = useState('2026-09-01');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);

  // Selector variables for calendar
  const [bookDate, setBookDate] = useState('2026-06-10');
  const [bookTime, setBookTime] = useState('14:30');
  const [bookType, setBookType] = useState<'VIDEO' | 'PHONE'>('VIDEO');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Conversation chat box variables
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [typedInput, setTypedInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isHandoffTriggered, setIsHandoffTriggered] = useState(false);

  // Triggers indicators states
  const [wasManuallyClosed, setWasManuallyClosed] = useState(() => {
    return sessionStorage.getItem('enrollai_widget_dismissed') === 'true';
  });
  const [showTooltip, setShowTooltip] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitModalSubmitted, setExitModalSubmitted] = useState(false);
  const [exitEmailInput, setExitEmailInput] = useState('');
  const [isIdle, setIsIdle] = useState(false);
  const [interactionRating, setInteractionRating] = useState<number | null>(null);

  // Scrolling check flags
  const scrollRef = useRef<HTMLDivElement>(null);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  // Load custom backend widget parameters
  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/widget/config');
      if (res.ok) {
        const data = await res.json();
        setWidgetConfig(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.warn("Express server config not yet active, relying on defaults.", err);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [isOpen]);

  // Listen to live brand customizer parameter updates in real-time
  useEffect(() => {
    const handleLiveConfig = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setWidgetConfig(prev => ({ ...prev, ...customEvent.detail }));
      }
    };
    window.addEventListener('enrollai-widget-config-live', handleLiveConfig);
    return () => {
      window.removeEventListener('enrollai-widget-config-live', handleLiveConfig);
    };
  }, []);

  // Proactive trigger 1: Time-Delayed Tooltip Pop
  useEffect(() => {
    if (!isOpen && widgetConfig.timeTriggerEnabled && !wasManuallyClosed) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
      }, widgetConfig.timeTriggerDelay * 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, widgetConfig.timeTriggerEnabled, widgetConfig.timeTriggerDelay, wasManuallyClosed]);

  // Proactive trigger 2: Scroll Depth Pop
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen || !widgetConfig.scrollTriggerEnabled || wasManuallyClosed) return;
      
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / (totalHeight || 1)) * 100;
      
      if (scrolled >= widgetConfig.scrollTriggerPercent) {
        setIsOpen(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen, widgetConfig.scrollTriggerEnabled, widgetConfig.scrollTriggerPercent, wasManuallyClosed]);

  // Proactive trigger 3: Exit Intent Recovery Modal
  useEffect(() => {
    if (!widgetConfig.exitIntentEnabled || wasManuallyClosed) return;
    
    const handleMouseLeave = (e: MouseEvent) => {
      // Prompt modal if cursor leaves standard top bound viewport (user closes or switches tab)
      if (e.clientY < 15 && !showExitModal && !exitModalSubmitted) {
        setShowExitModal(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [widgetConfig.exitIntentEnabled, showExitModal, exitModalSubmitted, wasManuallyClosed]);

  // Proactive trigger 4: Idle Pulsation Glow Aura
  useEffect(() => {
    const resetIdle = () => {
      setIsIdle(false);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        if (widgetConfig.idleTriggerEnabled && !isOpen) {
          setIsIdle(true);
        }
      }, 10000); // 10 seconds of complete idle
    };

    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('keypress', resetIdle);
    resetIdle();

    return () => {
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('keypress', resetIdle);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [isOpen, widgetConfig.idleTriggerEnabled]);

  // Onboarding slides content
  const slides = [
    {
      emoji: '🎓',
      title: 'Horizon Admissions AI',
      desc: 'Connect with a smart admissions chatbot index. We calculate scholarship eligibility ratios and answer tuition schedules instantly.'
    },
    {
      emoji: '💬',
      title: 'Instant 24/7 Support',
      desc: 'No more waiting for email responses. Our integrated RAG model reviews official catalogs to verify criteria anytime.'
    },
    {
      emoji: '📅',
      title: 'Advising Calendar Planners',
      desc: 'Book free video orientation and advisory sessions directly with our international admissions office in Cameroon.'
    }
  ];

  // Auto scroll down in chatbox
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  const handleOpenWidget = async () => {
    setIsOpen(true);
    setShowTooltip(false);

    // Initialize session with backend Express
    if (!sessionCreated) {
      try {
        const res = await fetch('/api/widget/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
        if (res.ok) {
          const conv = await res.json();
          setChatMessages(conv.messages || []);
          setSessionCreated(true);
        }
      } catch (err) {
        setSessionCreated(true); // fall back offline
      }
    }
  };

  const handleNextSlide = () => {
    if (slideIndex < slides.length - 1) {
      setSlideIndex(prev => prev + 1);
    } else {
      handleSkipSlides();
    }
  };

  const handleSkipSlides = () => {
    if (widgetConfig.leadCaptureEnabled && !leadCaptured) {
      setActivePanel('lead_form');
    } else {
      setActivePanel('chat');
    }
  };

  const handleSubmitLeadForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadEmail) return;

    setFormSubmitting(true);
    try {
      const res = await fetch('/api/widget/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          fullName: leadName,
          email: leadEmail,
          phone: leadPhone,
          country: leadCountry,
          city: leadCity,
          programInterest: leadProgram,
          startDate: leadDate
        })
      });
      if (res.ok) {
        setLeadCaptured(true);
        if (widgetConfig.bookingEnabled) {
          setActivePanel('scheduler');
        } else {
          setActivePanel('chat');
        }
      }
    } catch (err) {
      // offline fallback
      setLeadCaptured(true);
      setActivePanel('chat');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/widget/appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          leadName,
          program: leadProgram,
          date: bookDate,
          time: bookTime,
          type: bookType
        })
      });
      if (res.ok) {
        setBookingConfirmed(true);
        setTimeout(() => {
          setActivePanel('chat');
        }, 3000);
      }
    } catch (err) {
      setBookingConfirmed(true);
      setTimeout(() => setActivePanel('chat'), 2000);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;

    const userText = typedInput;
    setTypedInput('');

    // Prepend user message visually immediately
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'USER',
      content: userText,
      createdAt: new Date().toISOString()
    };
    setChatMessages(items => [...items, userMsg]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/widget/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: userText })
      });
      
      if (res.ok) {
        const bodyObj = await res.json();
        // Append response with nice typist staggered effect
        setTimeout(() => {
          setIsTyping(false);
          setChatMessages(items => [...items, bodyObj.message]);
        }, 1200);
      }
    } catch (err) {
      setTimeout(() => {
        setIsTyping(false);
        const fallbackAiMsg: Message = {
          id: `ai-${Date.now()}`,
          role: 'ASSISTANT',
          content: "Sorry, our database endpoints are currently recalibrating training weights. Please speak with an active agent instead!",
          confidence: 70,
          citationSource: 'Offline Backup Router',
          createdAt: new Date().toISOString()
        };
        setChatMessages(items => [...items, fallbackAiMsg]);
      }, 1000);
    }
  };

  const handleTakeoverRescue = async () => {
    setIsHandoffTriggered(true);
    try {
      const backendId = `conv-1`; // link takeover lookup
      await fetch(`/api/conversations/${backendId}/takeover`, { method: 'POST' });
    } catch (err) {
      console.warn("Handoff trigger routed offline");
    }
  };

  const handleRatingSelect = (stars: number) => {
    setInteractionRating(stars);
  };

  const isLeft = widgetConfig.position === 'left_bottom';
  const posClass = isLeft ? 'left-6 md:left-8' : 'right-6 md:right-8';

  return (
    <>
      {/* Dynamic Proactive trigger: Time-delayed Tooltip preview */}
      {showTooltip && (
        <div className={`fixed bottom-22 ${posClass} bg-white border border-zinc-200 p-4 rounded-2xl shadow-xl w-64 animate-bounce z-50 flex flex-col gap-2.5`}>
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase text-[#FF5C3A] tracking-wider flex items-center gap-1" style={{ color: 'var(--color-accent)' }}>
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>{widgetConfig.botName || 'Horizon Advisor'}</span>
            </span>
            <button onClick={() => {
              setShowTooltip(false);
              setWasManuallyClosed(true);
              sessionStorage.setItem('enrollai_widget_dismissed', 'true');
            }} className="text-neutral-400 hover:text-neutral-600 transition cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-neutral-700 leading-tight">
            Hi! Let's check your GPA scholarship ratios or browse tuition installment catalogs. Click to chat!
          </p>
        </div>
      )}

      {/* Dynamic Proactive trigger: Exit Intent recovery modal overlay */}
      {showExitModal && (
        <div className="fixed inset-0 z-[100] bg-zinc-950/70 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in text-neutral-900">
          <div className="bg-white border rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden">
            <span className="absolute -top-12 -right-12 p-16 rounded-full bg-red-500/10 block pointer-events-none"></span>
            
            <button 
              onClick={() => {
                setShowExitModal(false);
                setWasManuallyClosed(true);
                sessionStorage.setItem('enrollai_widget_dismissed', 'true');
              }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2 relative">
              <div className="inline-flex py-1 px-3.5 bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1 leading-none shrink-0 self-start">
                <ShieldAlert className="w-3.5 h-3.5" /> Stop! Wait a minute
              </div>
              <h3 className="text-xl font-bold tracking-tight text-neutral-950">Don't lose your scholarship slot!</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Admissions close on July 15. Drop your email address below, and we will automatically lock in your <span className="font-bold text-emerald-500">30% to 45% tuition waiver discount</span>.
              </p>
            </div>

            {!exitModalSubmitted ? (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (exitEmailInput) setExitModalSubmitted(true);
                }} 
                className="space-y-3"
              >
                <input
                  type="email"
                  required
                  value={exitEmailInput}
                  onChange={(e) => setExitEmailInput(e.target.value)}
                  placeholder="Enter your prospective student email..."
                  className="w-full bg-stone-50 border rounded-xl px-4 py-3 text-xs focus:bg-white outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-white text-xs font-bold font-mono transition shadow-lg cursor-pointer"
                  style={{ background: 'var(--accent-gradient)' }}
                >
                  Secure My Waiver Discount Slot
                </button>
              </form>
            ) : (
              <div className="bg-emerald-50 border border-emerald-250 rounded-2xl p-4 text-emerald-800 text-xs text-center font-semibold">
                ✓ Academic waiver secured! Check your inbox for confirmation vouchers.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main floating launcher bubble widget */}
      {!isOpen && (
        <button
          onClick={handleOpenWidget}
          id="btn_floating_launcher"
          className={`fixed bottom-6 ${posClass} p-4.5 rounded-full text-white shadow-2xl border transition-all z-50 hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer ${isIdle && (widgetConfig.pulseEnabled !== false) ? 'ring-8 animate-pulse' : ''}`}
          style={{ 
            background: 'var(--launcher-gradient)', 
            boxShadow: '0 8px 24px var(--accent-shadow)',
            borderColor: 'rgba(255,255,255,0.2)',
            ringColor: 'var(--accent-shadow)'
          }}
          title="Open Admissions Assistant"
        >
          {widgetConfig.launcherEmoji ? (
            <span className="text-xl inline-block leading-none select-none font-sans" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{widgetConfig.launcherEmoji}</span>
          ) : (
            <MessageSquare className="w-6 h-6" />
          )}
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div 
          id="chat_window_card" 
          className={`fixed bottom-6 ${posClass} w-full max-w-sm h-[520px] rounded-3xl shadow-2xl border overflow-hidden flex flex-col z-50 animate-fade-in-up text-[var(--color-text-primary)]`} 
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}
        >
          {/* Active Banner Header */}
          <div className="px-5 py-4 flex items-center justify-between text-white shadow" style={{ background: 'var(--accent-gradient)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 text-white shadow animate-pulse">
                <Sparkles className="w-5.5 h-5.5" />
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-tight">{widgetConfig.botName}</h4>
                <div className="flex items-center gap-1 text-[10px] opacity-85 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Horizon RAG System Active</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => {
                setIsOpen(false);
                setWasManuallyClosed(true);
                sessionStorage.setItem('enrollai_widget_dismissed', 'true');
              }}
              className="text-white hover:text-stone-200 p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ACTIVE VIEWS SWITCH */}
          <div className="flex-1 overflow-hidden flex flex-col bg-[var(--color-bg-secondary)]" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            
            {/* PANEL 1: Onboarding Carousel slides */}
            {activePanel === 'slides' && (
              <div className="flex-1 p-6 flex flex-col justify-between items-center text-center animate-fade-in bg-[var(--color-bg-card)] h-full" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                <div className="space-y-4 pt-10 flex flex-col items-center">
                  <span className="text-5xl block animate-bounce">{slides[slideIndex].emoji}</span>
                  <div className="space-y-1.5">
                    <h5 className="font-extrabold text-sm text-neutral-950">{slides[slideIndex].title}</h5>
                    <p className="text-xs text-neutral-500 leading-relaxed max-w-xs">{slides[slideIndex].desc}</p>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex items-center gap-1.5">
                  {slides.map((_, sIdx) => (
                    <span 
                      key={sIdx} 
                      className={`h-1.5 rounded-full transition-all ${slideIndex === sIdx ? 'w-4.5 bg-accent' : 'w-1.5 bg-zinc-200'}`}
                      style={slideIndex === sIdx ? { backgroundColor: 'var(--color-accent)' } : undefined}
                    ></span>
                  ))}
                </div>

                <div className="flex justify-between items-center w-full border-t border-zinc-100 pt-4 mt-6">
                  <button 
                    onClick={handleSkipSlides}
                    className="text-xs font-semibold text-neutral-400 hover:text-neutral-600 transition cursor-pointer"
                  >
                    Skip Onboarding
                  </button>

                  <button
                    onClick={handleNextSlide}
                    className="px-5 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-0.5 transition cursor-pointer"
                    style={{ background: 'var(--accent-gradient)' }}
                  >
                    <span>{slideIndex === slides.length - 1 ? 'Get Started' : 'Next'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* PANEL 2: Interactive Leads Form */}
            {activePanel === 'lead_form' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4 animate-fade-in bg-[var(--color-bg-card)]" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                <div className="space-y-1 text-center">
                  <h4 className="text-xs font-extrabold text-[#FF5C3A] uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>{translate('collectLeadTitle')}</h4>
                  <p className="text-[11px] text-neutral-400 leading-normal max-w-xs mx-auto">{translate('collectLeadDesc')}</p>
                </div>

                <form onSubmit={handleSubmitLeadForm} className="space-y-3.5 pt-2">
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-neutral-450" />
                    <input
                      type="text"
                      required
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder={translate('fullNameField')}
                      className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-neutral-400 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-[var(--color-bg-primary)] focus:outline-none"
                    />
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-neutral-450" />
                    <input
                      type="email"
                      required
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      placeholder={translate('emailField')}
                      className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-neutral-400 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-[var(--color-bg-primary)] focus:outline-none"
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-neutral-450" />
                    <input
                      type="tel"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      placeholder={translate('phoneField')}
                      className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-neutral-400 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-[var(--color-bg-primary)] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={leadCountry}
                      onChange={(e) => setLeadCountry(e.target.value)}
                      placeholder={translate('countryField')}
                      className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-neutral-400 rounded-xl px-3 py-2 text-xs focus:bg-[var(--color-bg-primary)] focus:outline-none"
                    />
                    <select
                      value={leadProgram}
                      onChange={(e) => setLeadProgram(e.target.value)}
                      className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-2 py-2 text-xs focus:bg-[var(--color-bg-primary)] focus:outline-none"
                    >
                      <option className="bg-neutral-850 text-neutral-900" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}>Executive MBA (EN/FR)</option>
                      <option className="bg-neutral-850 text-neutral-900" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}>B.Sc. Software Engineering</option>
                      <option className="bg-neutral-850 text-neutral-900" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}>Master in Public Health</option>
                      <option className="bg-neutral-850 text-neutral-900" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}>Hospitality Hospitality</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full py-2.5 rounded-xl text-white text-xs font-bold font-mono transition shadow-lg cursor-pointer"
                    style={{ background: 'var(--accent-gradient)' }}
                  >
                    {formSubmitting ? translate('sending') : translate('submitField')}
                  </button>
                </form>
              </div>
            )}

            {/* PANEL 3: Advising Scheduling scheduler */}
            {activePanel === 'scheduler' && (
              <div className="flex-1 p-5 space-y-4 animate-fade-in bg-[var(--color-bg-card)] overflow-y-auto" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                <div className="space-y-1 text-center">
                  <span className="text-[10px] font-black uppercase text-[#FF5C3A]" style={{ color: 'var(--color-accent)' }}>{translate('bookCallTitle')}</span>
                  <h5 className="font-extrabold text-xs text-[var(--color-text-primary)]">{translate('bookCallDesc')}</h5>
                </div>

                {!bookingConfirmed ? (
                  <form onSubmit={handleBookAppointment} className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Date Selector</label>
                      <input
                        type="date"
                        required
                        value={bookDate}
                        onChange={(e) => setBookDate(e.target.value)}
                        className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-3 py-2 text-xs focus:bg-[var(--color-bg-primary)] outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Appointment Time</label>
                        <input
                          type="time"
                          required
                          value={bookTime}
                          onChange={(e) => setBookTime(e.target.value)}
                          className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-3 py-2 text-xs focus:bg-[var(--color-bg-primary)] outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Channel Type</label>
                        <select
                          value={bookType}
                          onChange={(e) => setBookType(e.target.value as any)}
                          className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-2 py-2 text-xs focus:bg-[var(--color-bg-primary)] outline-none cursor-pointer"
                        >
                          <option value="VIDEO" className="bg-neutral-850 text-neutral-900" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}>Video Call</option>
                          <option value="PHONE" className="bg-neutral-850 text-neutral-900" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}>Phone Interview</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 text-xs pt-2">
                      <button
                        type="button"
                        onClick={() => setActivePanel('chat')}
                        className="flex-1 py-2.5 border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl hover:bg-[var(--color-bg-secondary)] transition cursor-pointer"
                      >
                        Skip
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 text-white rounded-xl font-bold transition shadow"
                        style={{ background: 'var(--accent-gradient)' }}
                      >
                        {translate('confirmBooking')}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs font-semibold p-4 rounded-2xl text-center flex flex-col items-center gap-1.5">
                    <UserCheck className="w-8 h-8 text-emerald-500 animate-bounce" />
                    <span>{translate('bookSuccessMessage')}</span>
                  </div>
                )}
              </div>
            )}

            {/* PANEL 4: Chat box conversations */}
            {activePanel === 'chat' && (
              <div className="flex-1 flex flex-col overflow-hidden h-full">
                
                {/* Scroll messages panel */}
                <div ref={scrollRef} className="flex-1 p-4 space-y-4 overflow-y-auto text-xs">
                  
                  {/* System Initial Greeting message */}
                  <div className="flex justify-start">
                    <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] p-3 rounded-2xl rounded-bl-none max-w-[85%] leading-relaxed shadow-sm">
                      {widgetConfig.welcomeMessage}
                    </div>
                  </div>

                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                      <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed shadow-sm ${msg.role === 'USER' ? 'text-white rounded-br-none shadow shadow-accent/50' : 'bg-[var(--color-bg-secondary)] border rounded-bl-none border-[var(--color-border)] text-[var(--color-text-primary)]'}`} style={msg.role === 'USER' ? { background: 'var(--accent-gradient)' } : undefined}>
                        {msg.role === 'AGENT' && (
                          <span className="block text-[9px] uppercase font-serif font-bold text-accent mb-0.5 tracking-wider" style={{ color: 'var(--color-accent)' }}>Live Advisor</span>
                        )}
                        <p className="text-xs whitespace-pre-line">{msg.content}</p>
                        
                        {msg.role === 'ASSISTANT' && widgetConfig.confidenceDisplayEnabled && (
                          <div className="mt-1.5 pt-1.5 border-t border-[var(--color-border)] flex items-center justify-between text-[9px] text-[var(--color-text-secondary)]">
                            <span className="font-mono">Confidence: {msg.confidence}%</span>
                            <span className="font-bold shrink-0 truncate max-w-[120px]" title={msg.citationSource}>Cite: {msg.citationSource || 'Brochure'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-3.5 rounded-2xl rounded-bl-none flex items-center gap-1 shadow-sm">
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-75"></span>
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-150"></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stars index interaction feedback triggers */}
                {chatMessages.length >= 2 && interactionRating === null && (
                  <div className="mx-4 mb-2 p-2 bg-amber-50/50 rounded-xl border border-amber-250 text-center animate-fade-in flex flex-col items-center gap-1 shadow-sm shrink-0" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                    <span className="text-[10px] font-bold text-[var(--color-text-primary)]">Rate this AI response match rating</span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((starIdx) => (
                        <button 
                           key={starIdx} 
                           type="button"
                           onClick={() => handleRatingSelect(starIdx)}
                           className="hover:scale-125 transition cursor-pointer text-amber-500 text-sm font-mono"
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Human taker, takeover buttons */}
                {widgetConfig.humanHandoffEnabled && !isHandoffTriggered && (
                  <div className="px-4.5 py-1.5 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] flex items-center justify-between shadow-inner shrink-0 text-[11px] text-[var(--color-text-secondary)]">
                    <span>Stuck with questions?</span>
                    <button
                      onClick={handleTakeoverRescue}
                      className="text-accent hover:underline font-extrabold cursor-pointer"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      Request Human Advisor Takeover
                    </button>
                  </div>
                )}

                {isHandoffTriggered && (
                  <div className="px-4.5 py-1.5 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between shrink-0 text-[11px] font-bold text-emerald-800" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'rgb(16, 185, 129)', borderColor: 'var(--color-border)' }}>
                    <span>Advisor Rescue Taking Over...</span>
                    <span className="text-[10px] animate-pulse">● Connecting Live</span>
                  </div>
                )}

                {/* Footer Send box */}
                <form onSubmit={handleSendChatMessage} className="p-3.5 bg-[var(--color-bg-card)] border-t border-[var(--color-border)] flex gap-2 shrink-0">
                  <input
                    type="text"
                    value={typedInput}
                    onChange={(e) => setTypedInput(e.target.value)}
                    placeholder="Compare programs and scholarships..."
                    className="flex-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-neutral-400 rounded-xl px-3.5 py-2.5 text-xs focus:bg-[var(--color-bg-primary)] outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                    style={{ ringColor: 'var(--color-accent)' }}
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-xl text-white shadow hover:scale-105 active:scale-95 transition cursor-pointer flex items-center justify-center shrink-0"
                    style={{ background: 'var(--accent-gradient)' }}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
