import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { useAppTheme, THEMES } from './ThemeContext';
import { ArrowRight, HelpCircle, Check, Globe, Star, Play, Sparkles, MessageSquare, AlertCircle, Ban, Zap, ShieldAlert, ShieldCheck, Palette, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LandingPageProps {
  onStartDemo: () => void;
  onLogin: () => void;
}

export default function LandingPage({ onStartDemo, onLogin }: LandingPageProps) {
  const { translate, activeLanguage, setIsLanguage } = useLanguage();
  const { activeTheme, setThemeById } = useAppTheme();
  const [isAnnual, setIsAnnual] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto-playing interactive chat widget preview variables
  const [mockMessages, setMockMessages] = useState<Array<{ role: 'USER' | 'ASSISTANT', text: string }>>([
    { role: 'USER', text: 'Hi, I live in Douala. Do you offer scholarships for Fall 2026?' }
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const scenario = [
    { role: 'ASSISTANT' as const, text: 'Hello! Yes, Horizon University offers up to 45% Merit Excellence Scholarships for students in Cameroon/Africa! Grade evaluations are automatic.' },
    { role: 'USER' as const, text: 'Amazing! What are the requirements for the Software Engineering program?' },
    { role: 'ASSISTANT' as const, text: 'You need a transcript showing transcripts above 14/20 and proficiency proof. Would you like to book a free call with our coordinator tomorrow at 2:00 PM?' },
    { role: 'USER' as const, text: 'Perfect, let\'s book it!' },
    { role: 'ASSISTANT' as const, text: 'Great! Call is scheduled. I have sent details to your inbox. Let\'s make your enrollment smooth! 🎓' }
  ];

  useEffect(() => {
    if (currentStep >= scenario.length) {
      const timer = setTimeout(() => {
        setMockMessages([{ role: 'USER', text: 'Hi, I live in Douala. Do you offer scholarships for Fall 2026?' }]);
        setCurrentStep(0);
      }, 5000);
      return () => clearTimeout(timer);
    }

    const delay = scenario[currentStep].role === 'ASSISTANT' ? 2500 : 1800;
    const timer = setTimeout(() => {
      setIsTyping(true);
      const typeFactor = setTimeout(() => {
        setIsTyping(false);
        setMockMessages(prev => [...prev, scenario[currentStep]]);
        setCurrentStep(s => s + 1);
      }, 1500);
      return () => clearTimeout(typeFactor);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentStep]);

  const pricingTiers = [
    {
      name: translate('StarterName'),
      price_monthly: 49,
      price_annual: 39,
      features: ['1 Live Website Widget', '500 AI Assistant Conversations/mo', 'Interactive Lead Capture Form', 'Standard Dashboard Metrics', 'Standard Email Support']
    },
    {
      name: translate('GrowthName'),
      price_monthly: 99,
      price_annual: 79,
      features: ['3 Live Website Widgets', '5,000 AI Assistant Conversations/mo', 'Intelligent Visitor Auto-Triggers', 'Conversational Scheduler Interface', 'Advanced Geographic Analytics', 'Human Handoff Team rescue', 'Priority Email & Chat support'],
      popular: true
    },
    {
      name: translate('ProName'),
      price_monthly: 199,
      price_annual: 159,
      features: ['Unlimited Website Widgets', 'Unlimited Conversation Caps', 'White-labeling (No Powered By)', 'Reference Document RAG (PDF/Docx)', 'Direct Web scrapers and Custom FAQ matrices', 'Collaborative Advising Shared team inbox', 'Dedicated Success Coach']
    },
    {
      name: translate('AgencyName'),
      price_monthly: 499,
      price_annual: 399,
      features: ['Reseller White-label Multi-tenant engine', 'Unlimited client administration accounts', 'Revenue share analytics board', 'Branded client access portal', 'Direct CRM webhooks sync (Zapier/Salesforce)', 'SLA technical uptime guarantee']
    }
  ];

  const faqAccordion = [
    {
      q: 'How does the AI advisor gather its knowledge about our school?',
      a: 'EnrollAI uses a state-of-the-art Retrieval-Augmented Generation (RAG) system. You simply dump your official program brochures, pricing spreadsheets, and FAQ files into the dashboard, or paste your program URLs; files are scanned to give high-accuracy replies.'
    },
    {
      q: 'Will the AI hallucinate or give applicants wrong tuition amounts?',
      a: 'We implement strict validation controls. Below each AI response, a confidence meter is displayed. If similarity metrics fall below 70%, the system halts and suggests booking an orientation call with a human advisor.'
    },
    {
      q: 'How difficult is the installation on our school website?',
      a: 'You only inject one script tag directly into your website template header or footer (compatible with WordPress, Webflow, Squarespace, Wix, or custom HTML) and the assistant renders instantly.'
    },
    {
      q: 'Who owns the student lead contact records?',
      a: 'Your institution retains 100% ownership of your leads and conversational histories. Records can be filtered, archived, and exported to spreadsheets or external CRM software anytime.'
    },
    {
      q: 'Can human admissions staff override the bot when a hot applicant asks the same thing?',
      a: 'Yes! Advisors see live ongoing conversations in the Shared Inbox, receive desktop notifications when the student is frustrated, and can override the AI with a single click to chat directly.'
    },
    {
      q: 'Can we change the pricing plan or cancel our subscription anytime?',
      a: 'Yes, absolutely. You can upgrade, downgrade, or cancel directly from your secure Billing Panel. If you change models or cancel, your student leads remain fully downloadable.'
    }
  ];

  return (
    <div id="landing_root" className="min-h-screen flex flex-col transition-colors duration-300" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
      {/* Dynamic Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b flex items-center justify-between px-6 py-4 shadow-sm" style={{ borderBottomColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-xl text-white flex items-center justify-center shadow-md shadow-accent" style={{ background: 'var(--accent-gradient)' }}>
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Enroll<span className="text-accent underline decoration-wavy" style={{ color: 'var(--color-accent)' }}>AI</span></span>
        </div>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          <a href="#features" className="hover:text-accent transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-accent transition-colors">How It Works</a>
          <a href="#demo" className="hover:text-accent transition-colors">Interactive Demo</a>
          <a href="#pricing" className="hover:text-accent transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-accent transition-colors">FAQs</a>
        </nav>

        {/* Desktop actions (shown on large screens and above) */}
        <div className="hidden lg:flex items-center gap-2 sm:gap-4 lg:gap-3">
          {/* Theme Selector Dropdown */}
          <div className="flex items-center gap-1.5 rounded-lg px-1.5 sm:px-2.5 py-1.5 text-xs font-semibold border shrink-0 transition-all duration-200" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <Palette className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-accent)' }} />
            <select
              value={activeTheme.id}
              onChange={(e) => setThemeById(e.target.value as any)}
              className="bg-transparent outline-none cursor-pointer text-[11px] sm:text-xs font-bold max-w-[20px] sm:max-w-[100px] md:max-w-none border-none p-0 focus:ring-0 text-ellipsis overflow-hidden"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {Object.values(THEMES).map((t) => (
                <option key={t.id} value={t.id} className="text-zinc-950 bg-white">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Language Switch */}
          <div className="flex rounded-lg p-0.5 text-xs font-semibold border shrink-0" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <button
              onClick={() => setIsLanguage('en')}
              className="px-2.5 py-1 rounded-md transition-all shadow-sm cursor-pointer"
              style={activeLanguage === 'en' ? { backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' } : { color: 'var(--color-text-secondary)' }}
            >
              EN
            </button>
            <button
              onClick={() => setIsLanguage('fr')}
              className="px-2.5 py-1 rounded-md transition-all shadow-sm cursor-pointer"
              style={activeLanguage === 'fr' ? { backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' } : { color: 'var(--color-text-secondary)' }}
            >
              FR
            </button>
          </div>

          <button
            onClick={onLogin}
            id="btn_landing_login"
            className="text-[11px] sm:text-xs md:text-sm font-semibold px-2 sm:px-4 py-2 rounded-xl hover:opacity-85 transition-colors cursor-pointer border shrink-0"
            style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          >
            Advisor<span className="hidden sm:inline"> Portal</span>
          </button>
          
          <button
            onClick={onStartDemo}
            id="btn_landing_demo"
            className="text-[11px] sm:text-xs md:text-sm font-semibold text-white px-2.5 sm:px-5 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0"
            style={{ background: 'var(--accent-gradient)', boxShadow: '0 4px 14px var(--accent-shadow)' }}
          >
            <span>Live Demo</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>

        {/* Mobile/Tablet Header Controls (Hamburger button to maintain zero margin/padding layout overflow bugs) */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg border transition-all hover:opacity-80 cursor-pointer"
            style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 animate-pulse" />}
          </button>
        </div>
      </header>

      {/* Mobile/Tablet Drawer Dropdown Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="lg:hidden border-b overflow-hidden z-40 sticky top-[73px] w-full shadow-lg"
            style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="px-6 py-5 flex flex-col gap-6">
              {/* Navigation Links */}
              <div className="flex flex-col gap-4 text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                <a
                  href="#features"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-accent transition-colors py-1 border-b"
                  style={{ borderBottomColor: 'var(--color-border)' }}
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-accent transition-colors py-1 border-b"
                  style={{ borderBottomColor: 'var(--color-border)' }}
                >
                  How It Works
                </a>
                <a
                  href="#demo"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-accent transition-colors py-1 border-b"
                  style={{ borderBottomColor: 'var(--color-border)' }}
                >
                  Interactive Demo
                </a>
                <a
                  href="#pricing"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-accent transition-colors py-1 border-b"
                  style={{ borderBottomColor: 'var(--color-border)' }}
                >
                  Pricing
                </a>
                <a
                  href="#faq"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-accent transition-colors py-1"
                >
                  FAQs
                </a>
              </div>

              {/* Theme & Language mobile layouts */}
              <div className="flex flex-col gap-4 pt-4 border-t" style={{ borderTopColor: 'var(--color-border)' }}>
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Appearance Palette</span>
                  <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold border transition-all" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                    <Palette className="w-4 h-4 shrink-0" style={{ color: 'var(--color-accent)' }} />
                    <select
                      value={activeTheme.id}
                      onChange={(e) => setThemeById(e.target.value as any)}
                      className="bg-transparent outline-none cursor-pointer text-xs font-bold w-full border-none p-0 focus:ring-0"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {Object.values(THEMES).map((t) => (
                        <option key={t.id} value={t.id} className="text-zinc-950 bg-white">
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Language Preference</span>
                  <div className="flex rounded-xl p-1 text-xs font-bold border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                    <button
                      onClick={() => setIsLanguage('en')}
                      className="flex-1 py-2 rounded-lg transition-all shadow-sm cursor-pointer text-center"
                      style={activeLanguage === 'en' ? { backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' } : { color: 'var(--color-text-secondary)' }}
                    >
                      English (EN)
                    </button>
                    <button
                      onClick={() => setIsLanguage('fr')}
                      className="flex-1 py-2 rounded-lg transition-all shadow-sm cursor-pointer text-center"
                      style={activeLanguage === 'fr' ? { backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' } : { color: 'var(--color-text-secondary)' }}
                    >
                      Français (FR)
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Action Buttons */}
              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLogin();
                  }}
                  className="w-full text-xs font-bold px-4 py-3 rounded-xl hover:opacity-85 transition-colors cursor-pointer border text-center"
                  style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                >
                  Advisor Portal
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onStartDemo();
                  }}
                  className="w-full text-xs font-bold text-white px-5 py-3 rounded-xl hover:scale-[1.01] active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  style={{ background: 'var(--accent-gradient)', boxShadow: '0 4px 14px var(--accent-shadow)' }}
                >
                  <span>Live Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="px-4 xs:px-6 sm:px-8 md:px-12 py-16 md:py-24 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider style-badge" style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)' }}>
            <Zap className="w-3.5 h-3.5 animate-bounce" />
            <span>EnrollAI v2.0 Live Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.12] sm:leading-[1.15]" style={{ color: 'var(--color-text-primary)' }}>
            {translate('landingTitle')}
          </h1>

          <p className="text-sm sm:text-base md:text-lg max-w-xl leading-relaxed opacity-95 my-2" style={{ color: 'var(--color-text-secondary)' }}>
            {translate('landingSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              type="button"
              onClick={onStartDemo}
              id="hero_cta_demo"
              className="px-8 py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg text-lg cursor-pointer"
              style={{ background: 'var(--accent-gradient)', boxShadow: '0 8px 20px var(--accent-shadow)' }}
            >
              <Sparkles className="w-5 h-5" />
              <span>{translate('getStartedButton')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('demo');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 rounded-2xl border font-bold hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 text-lg cursor-pointer animate-fade-in"
              style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{translate('tryDemoButton')}</span>
            </button>
          </div>

          {/* Fully responsive stats details card - displays vertically as clean blocks where descriptions sit neatly under the metric tags */}
          <div className="w-full max-w-2xl mt-8 p-6 rounded-2xl border flex flex-col md:flex-row items-stretch justify-between gap-6 transition-all duration-200 animate-fade-in" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)' }}>
            <div className="flex flex-col items-center text-center p-3 rounded-xl hover:bg-zinc-500/5 transition-colors duration-200 flex-1 select-none w-full">
              <div className="flex-shrink-0 px-4 h-11 min-w-[80px] rounded-xl flex items-center justify-center font-black font-mono text-xs text-emerald-500 bg-emerald-500/10 shadow-sm border border-emerald-500/10 dark:border-emerald-500/20 whitespace-nowrap mb-3">100%</div>
              <div className="space-y-1">
                <span className="block text-xs font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>No Credit Card Required</span>
                <span className="block text-[10px] sm:text-xs" style={{ color: 'var(--color-text-secondary)' }}>Instant test environment ready</span>
              </div>
            </div>
            
            <div className="hidden md:block w-px self-stretch my-2" style={{ backgroundColor: 'var(--color-border)' }}></div>
            
            <div className="flex flex-col items-center text-center p-3 rounded-xl hover:bg-zinc-500/5 transition-colors duration-200 flex-1 select-none w-full">
              <div className="flex-shrink-0 px-4 h-11 min-w-[80px] rounded-xl flex items-center justify-center font-black font-mono text-xs text-emerald-500 bg-emerald-500/10 shadow-sm border border-emerald-500/10 dark:border-emerald-500/20 whitespace-nowrap mb-3">14 Days</div>
              <div className="space-y-1">
                <span className="block text-xs font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>Complete Free Trial</span>
                <span className="block text-[10px] sm:text-xs" style={{ color: 'var(--color-text-secondary)' }}>No locked or throttled features</span>
              </div>
            </div>
            
            <div className="hidden md:block w-px self-stretch my-2" style={{ backgroundColor: 'var(--color-border)' }}></div>
            
            <div className="flex flex-col items-center text-center p-3 rounded-xl hover:bg-zinc-500/5 transition-colors duration-200 flex-1 select-none w-full">
              <div className="flex-shrink-0 px-4 h-11 min-w-[80px] rounded-xl flex items-center justify-center font-black font-mono text-xs text-emerald-500 bg-emerald-500/10 shadow-sm border border-emerald-500/10 dark:border-emerald-500/20 whitespace-nowrap mb-3">1 Script</div>
              <div className="space-y-1">
                <span className="block text-xs font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>Embed Tag Install</span>
                <span className="block text-[10px] sm:text-xs" style={{ color: 'var(--color-text-secondary)' }}>Matches any website instantly</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Mock Playbox Chatbot */}
        <div id="demo" className="lg:col-span-5 w-full flex justify-center scroll-mt-24">
          <div className="w-full max-w-sm rounded-3xl border shadow-2xl overflow-hidden flex flex-col min-h-[460px] " style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
            <div className="px-5 py-4 border-b flex items-center justify-between shadow-sm" style={{ borderBottomColor: 'var(--color-border)', background: 'var(--accent-gradient)' }}>
              <div className="flex items-center gap-2 text-white">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border border-white/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Horizon AI Advisor</h4>
                  <div className="flex items-center gap-1 text-[11px] opacity-80">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{translate('botHeaderOnline')}</span>
                  </div>
                </div>
              </div>
              <HelpCircle className="w-5 h-5 text-white opacity-80" />
            </div>

            <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[320px] text-xs">
              {mockMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div 
                    className={`p-3 rounded-2xl max-w-[85%] leading-relaxed border ${msg.role === 'USER' ? 'rounded-br-none' : 'rounded-bl-none'}`}
                    style={msg.role === 'USER' 
                      ? { backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' } 
                      : { backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }
                    }
                  >
                    {msg.text}
                    {msg.role === 'ASSISTANT' && (
                      <div className="mt-1.5 pt-1 border-t flex items-center justify-between text-[10px]" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                        <div className="flex items-center gap-1">
                          <span className="w-4 h-1 bg-emerald-500 rounded-full"></span>
                          <span>94% score</span>
                        </div>
                        <span>Source: Scholarship Guideline</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="border p-3 rounded-2xl rounded-bl-none flex items-center gap-1" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce animate-pulse" style={{ backgroundColor: 'var(--color-text-secondary)' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce animate-pulse delay-75" style={{ backgroundColor: 'var(--color-text-secondary)' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce animate-pulse delay-150" style={{ backgroundColor: 'var(--color-text-secondary)' }}></span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t flex gap-2" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
              <input
                type="text"
                disabled
                placeholder="Ask enrollment info..."
                className="flex-1 border rounded-xl px-3 py-2 text-xs outline-none"
                style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
              <button disabled className="p-2 rounded-xl text-white opacity-85" style={{ background: 'var(--accent-gradient)' }}>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section id="features" className="py-20 border-t" style={{ borderTopColor: 'var(--color-border)', backgroundColor: 'rgba(255, 92, 58, 0.02)' }}>
        <div className="max-w-7xl mx-auto px-6 w-full space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight leading-tight sm:leading-none" style={{ color: 'var(--color-text-primary)' }}>
              {translate('problemTitle')}
            </h2>
            <p className="max-w-2xl mx-auto text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Every student who searches your courses program list at 11 PM and leaves empty-handed is an enrollment lost to competing institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-4">
            {/* Before Option */}
            <div className="border rounded-3xl p-8 flex flex-col justify-between space-y-6 shadow-md transition-all hover:shadow-lg" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                    <Ban className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{translate('problemBefore')}</h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  Prospective students are faced with complex layouts, unhelpful directories, and boring contact email forms which take as long as 48 hours to receive any replies.
                </p>
              </div>
              <ul className="space-y-2.5 text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                <li className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-red-500 shrink-0" /> Zero instant answers at 10 PM</li>
                <li className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-red-500 shrink-0" /> static PDF catalogs required</li>
                <li className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-red-500 shrink-0" /> Over 95% visitor abandonment rate</li>
              </ul>
            </div>

            {/* After Option */}
            <div className="border-2 rounded-3xl p-8 flex flex-col justify-between space-y-6 shadow-xl transition-all hover:shadow-2xl relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-accent)' }}>
              <div className="absolute top-0 right-0 p-3 bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider rounded-bl-xl shadow-md flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current" /> Recommend
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{translate('problemAfter')}</h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  Prospective students instantly chat with an intelligent, multi-lingual RAG agent that analyzes official brochures. It answers programmatic details and schedules advising video slots dynamically.
                </p>
              </div>
              <ul className="space-y-2.5 text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" /> Fast 24/7 personalized scholarship checks</li>
                <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" /> Conversational onboarding & advising slot booking</li>
                <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" /> 15x higher conversion than standard forms</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-6 w-full space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-block px-3 py-1 rounded-md text-xs font-bold uppercase" style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)', borderColor: 'var(--color-border)' }}>Admissions Automation</div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>How EnrollAI Transforms Your Site</h2>
          <p className="max-w-2xl mx-auto text-xs" style={{ color: 'var(--color-text-secondary)' }}>Get up and running in less than 5 minutes with our zero-code automation script.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="space-y-4 border p-8 rounded-3xl relative" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <span className="text-5xl font-black font-mono" style={{ color: 'var(--color-border)' }}>01</span>
            <h4 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Configure & Brand</h4>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Name your bot, pick a theme (like Slate & Coral or Aurora), choose English/French translation prompts, and set active proactive trigger timelines.
            </p>
          </div>

          <div className="space-y-4 border p-8 rounded-3xl relative" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <span className="text-5xl font-black font-mono" style={{ color: 'var(--color-border)' }}>02</span>
            <h4 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Inject School Knowledge</h4>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Drag-and-drop your tuition brochures or syllabus documents, or type in common manual FAQs. Our RAG engine index embeds everything instantly.
            </p>
          </div>

          <div className="space-y-4 border p-8 rounded-3xl relative" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <span className="text-5xl font-black font-mono" style={{ color: 'var(--color-border)' }}>03</span>
            <h4 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Copy Embed Code</h4>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Copy and paste the self-contained JavaScript snippet into your footer. Witness captured leads, appointments, and metrics fly into your dashboard!
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 border-t" style={{ backgroundColor: 'var(--color-bg-secondary)', borderTopColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-6 w-full space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>SaaS Growth-Focused Tiers</h2>
            <p className="max-w-2xl mx-auto text-xs" style={{ color: 'var(--color-text-secondary)' }}>Pick a standard SaaS model. All options come with a robust 14-day fully-featured trial period.</p>

            {/* Annual Switcher */}
            <div className="flex items-center justify-center gap-3 pt-4">
              <span className="text-sm font-semibold" style={{ color: !isAnnual ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>Monthly Billing</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="w-12 h-6 rounded-full p-1 transition-colors relative flex items-center border"
                style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
              >
                <span className={`w-4 h-4 rounded-full transition-all shadow ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} style={{ backgroundColor: 'var(--color-accent)' }}></span>
              </button>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold" style={{ color: isAnnual ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>Annual Billing</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)' }}>Save 20%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {pricingTiers.map((tier, idx) => (
              <div 
                key={idx} 
                className={`border rounded-3xl p-6 flex flex-col justify-between shadow transition-all hover:scale-[1.02] hover:shadow-xl relative ${tier.popular ? 'border-2 ring-1' : ''}`} 
                style={{ 
                  backgroundColor: 'var(--color-bg-card)', 
                  borderColor: tier.popular ? 'var(--color-accent)' : 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              >
                {tier.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white" style={{ background: 'var(--accent-gradient)' }}>
                    Most Popular
                  </span>
                )}
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{tier.name}</h4>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-extrabold" style={{ color: 'var(--color-text-primary)' }}>${isAnnual ? tier.price_annual : tier.price_monthly}</span>
                      <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>/ month</span>
                    </div>
                  </div>

                  <ul className="space-y-2 pt-2">
                    {tier.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-[11px] leading-tight" style={{ color: 'var(--color-text-secondary)' }}>
                        <Check className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={onStartDemo}
                  className="w-full mt-6 py-3 rounded-xl font-bold text-xs transition-all shadow cursor-pointer text-center flex items-center justify-center text-center hover:opacity-90"
                  style={tier.popular ? { background: 'var(--accent-gradient)', color: 'white' } : { backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
                >
                  Start 14-day Free Trial
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 max-w-7xl mx-auto px-6 w-full space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Trusted by Global Administrators</h2>
          <p className="max-w-xl mx-auto text-xs" style={{ color: 'var(--color-text-secondary)' }}>See how admissions officers scale their capture volume and conversion without expanding support payroll.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border p-6 rounded-3xl flex flex-col justify-between space-y-6 shadow-sm" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <p className="text-xs italic leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              "We connected EnrollAI on our international courses page. The RAG assistant answered scholarship deadlines with 100% accuracy. Over 340 applicants from African countries scheduled video slots within the first month. Our enrollments surged by 22%."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>MT</div>
              <div>
                <h5 className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>Dr. Marc Tchinda</h5>
                <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>VP Admissions, IUDS Tech Yaoundé</p>
              </div>
            </div>
          </div>

          <div className="border p-6 rounded-3xl flex flex-col justify-between space-y-6 shadow-sm" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <p className="text-xs italic leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              "Late-night traffic was a massive black hole for us. Prospects landed from Canada or France, found no counselor active, and left. EnrollAI captures their emails and phone numbers seamlessly via a neat conversational flow. Truly revolutionary."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>GN</div>
              <div>
                <h5 className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>Gabrielle Ndu</h5>
                <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Dean of Marketing, Horizon Collège Montreal</p>
              </div>
            </div>
          </div>

          <div className="border p-6 rounded-3xl flex flex-col justify-between space-y-6 shadow-sm" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <p className="text-xs italic leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              "The ability for our recruitment advisor to override the AI live whenever a student expresses frustration is priceless. The geographic metrics panel shows exactly what continents our hot leads are calling from."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>IA</div>
              <div>
                <h5 className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>Ismail Amrani</h5>
                <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Admissions Director, LSI Rabat</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ accordion */}
      <section id="faq" className="py-20 border-t max-w-7xl mx-auto px-6 w-full rounded-2xl mb-12 shadow-sm" style={{ borderTopColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-8" style={{ color: 'var(--color-text-primary)' }}>Frequently Answered Queries</h2>
        
        <div className="max-w-3xl mx-auto space-y-4">
          {faqAccordion.map((faq, idx) => (
            <div key={idx} className="border rounded-2xl overflow-hidden transition-all shadow-sm" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-sm hover:opacity-85 transition-colors cursor-pointer"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <span>{faq.q}</span>
                <span className="text-lg font-mono text-accent" style={{ color: 'var(--color-accent)' }}>{activeFaq === idx ? '−' : '+'}</span>
              </button>
              
              <div 
                className={`transition-all duration-300 px-6 overflow-hidden ${activeFaq === idx ? 'max-h-[300px] py-4 border-t' : 'max-h-0'}`}
                style={{ borderColor: 'var(--color-border)' }}
              >
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t py-8 px-6 text-center text-xs max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-6" style={{ borderTopColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg text-white flex items-center justify-center text-xs font-bold" style={{ background: 'var(--accent-gradient)' }}>E</div>
          <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>EnrollAI Inc.</span>
        </div>
        
        <div className="flex flex-col gap-1 items-center">
          <p>© 2026 EnrollAI Platform. All rights reserved. Global Student Enrollment & Conversational AI Services.</p>
          <p className="text-[10px] opacity-75 sm:text-xs">
            Crafted with precision by <span className="font-semibold transition-colors duration-200" style={{ color: 'var(--color-accent)' }}>NesForgestudios<sup>™</sup></span>
          </p>
        </div>

        <div className="flex gap-4">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Service Terms</a>
          <a href="#" className="hover:underline">Support</a>
        </div>
      </footer>
    </div>
  );
}
