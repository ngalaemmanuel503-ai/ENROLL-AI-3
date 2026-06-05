import React, { useState, useEffect } from 'react';
import { ThemeProvider, useAppTheme, THEMES } from './components/ThemeContext';
import { LanguageProvider, useLanguage } from './components/LanguageContext';
import LandingPage from './components/LandingPage';
import OnboardingWizard from './components/OnboardingWizard';
import OnboardingChecklist from './components/OnboardingChecklist';
import FloatingWidget from './components/FloatingWidget';
import KnowledgeBasePage from './components/KnowledgeBasePage';
import BillingPage from './components/BillingPage';
import ReportsPage from './components/ReportsPage';
import TeamMembers from './components/TeamMembers';
import UserProfile from './components/UserProfile';
import ConfigurationReminderWidget from './components/ConfigurationReminderWidget';

import { 
  Sparkles, MessageSquare, Database, Calendar as CalendarIcon, 
  Settings, CreditCard, ChevronRight, CheckCircle, Circle, 
  MapPin, Plus, ArrowRight, Compass, ShieldAlert, BarChart3, 
  Users, User, Trash, Filter, Search, Shield, Save, Check, RefreshCcw, LogOut, ArrowUpRight, GraduationCap, Link2, BookOpen, X, ChevronDown, Menu, Wand2
} from 'lucide-react';
import { motion } from 'motion/react';

import { Lead, Conversation, Appointment, Program, ThemeId, Message } from './types';
import AuthPage from './components/AuthPage';

// Authenticated fetch wrapper for premium session calls
const authFetch = (url: string, options: any = {}) => {
  const token = localStorage.getItem('enrollai_session_token');
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
  return fetch(url, { ...options, headers });
};

function MainApp() {
  const { translate, activeLanguage, setIsLanguage } = useLanguage();
  const { activeTheme, setThemeById, isGlobalDarkMode, setGlobalDarkModeOverride } = useAppTheme();

  // Authentication & Wizard states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [skippedWizard, setSkippedWizard] = useState(() => {
    return localStorage.getItem('enrollai_skipped_wizard') === 'true';
  });
  const [showAuth, setShowAuth] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('signup');
  const [userRole, setUserRole] = useState<'OWNER' | 'ADMIN'>('OWNER');

  // Sidebar navigation routes
  // 'dashboard' | 'leads' | 'conversations' | 'kb' | 'programs' | 'appointments' | 'reports' | 'widget_config' | 'billing' | 'profile'
  const [activeTab, setActiveTab ] = useState<string>('dashboard');
  const [tenantProfile, setTenantProfile] = useState<any>(null);

  // Core collections synced from server
  const [leads, setLeads] = useState<Lead[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter queries
  const [leadQuery, setLeadQuery] = useState('');
  const [activeLeadFilter, setActiveLeadFilter] = useState<'ALL' | 'HOT' | 'CONVERTED' | 'COLD'>('ALL');

  // Active chat in Shared Inbox state
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [agentReplyText, setAgentReplyText] = useState('');

  // Checklist steps state
  const [checklistSteps, setChecklistSteps] = useState([
    { id: 1, label: 'Set your bot name and accent color', tabKey: 'widget_config', completed: true },
    { id: 2, label: 'Upload your program brochure or enter FAQs', tabKey: 'kb', completed: false },
    { id: 3, label: 'Test and configure triggers in the configuration page', tabKey: 'widget_config', completed: false },
    { id: 4, label: 'Copy and embed the widget script tag on school website', tabKey: 'widget_config', completed: false },
    { id: 5, label: 'Invite your first team member or student advisor', tabKey: 'dashboard', completed: true }
  ]);
  const [showChecklist, setShowChecklist] = useState(true);

  // Widget Settings Edit Form values
  const [cfgBotName, setCfgBotName] = useState('Horizon AI Advisor');
  const [cfgWelcomeMessage, setCfgWelcomeMessage] = useState('Hello! Welcome to Horizon University! How can I help you find the right program today? 🎓');
  const [cfgLeadCapture, setCfgLeadCapture] = useState(true);
  const [cfgBooking, setCfgBooking] = useState(true);
  const [cfgHandoff, setCfgHandoff] = useState(true);
  const [cfgConfidence, setCfgConfidence] = useState(true);
  const [cfgWhatsApp, setCfgWhatsApp] = useState(true);
  const [cfgWhatsAppNumber, setCfgWhatsAppNumber] = useState('+237 690 000 000');
  const [cfgTimeTrigger, setCfgTimeTrigger] = useState(true);
  const [cfgTimeDelay, setCfgTimeDelay] = useState(6);
  const [cfgScrollTrigger, setCfgScrollTrigger] = useState(true);
  const [cfgScrollPercent, setCfgScrollPercent] = useState(50);
  const [cfgExitIntent, setCfgExitIntent] = useState(true);
  const [cfgIdleTrigger, setCfgIdleTrigger] = useState(true);
  const [cfgPosition, setCfgPosition] = useState('right_bottom');
  const [cfgLauncherEmoji, setCfgLauncherEmoji] = useState('🎓');
  const [cfgPulseEnabled, setCfgPulseEnabled] = useState(true);
  const [cfgCustomAccent, setCfgCustomAccent] = useState('');
  const [showBrandCustomize, setShowBrandCustomize] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Update dynamic accent override in :root live in real-time
  useEffect(() => {
    if (cfgCustomAccent) {
      document.documentElement.style.setProperty('--color-accent', cfgCustomAccent);
      document.documentElement.style.setProperty('--accent-gradient', `linear-gradient(135deg, ${cfgCustomAccent}, ${cfgCustomAccent}cc)`);
      document.documentElement.style.setProperty('--launcher-gradient', `linear-gradient(135deg, ${cfgCustomAccent}, ${cfgCustomAccent}cc)`);
    } else if (activeTheme) {
      document.documentElement.style.setProperty('--color-accent', activeTheme.tokens.accent);
      document.documentElement.style.setProperty('--accent-gradient', activeTheme.tokens.accent_gradient);
      document.documentElement.style.setProperty('--launcher-gradient', activeTheme.tokens.launcher_gradient);
    }
  }, [cfgCustomAccent, activeTheme]);

  // New item creation forms
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadCountry, setNewLeadCountry] = useState('Cameroon');
  const [newLeadProgram, setNewLeadProgram] = useState('Executive MBA (EN/FR)');

  const [showAddProgModal, setShowAddProgModal] = useState(false);
  const [newProgName, setNewProgName] = useState('');
  const [newProgDept, setNewProgDept] = useState('Business');
  const [newProgDuration, setNewProgDuration] = useState('2 Years');
  const [newProgFees, setNewProgFees] = useState('$12,000 / Year');
  const [newProgBadge, setNewProgBadge] = useState('Limited seats');
  const [newProgDesc, setNewProgDesc] = useState('');

  // Validate token session when browser window starts up
  useEffect(() => {
    const token = localStorage.getItem('enrollai_session_token');
    if (token) {
      checkUserSession(token);
    }
  }, []);

  const checkUserSession = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/tenant/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIsLoggedIn(true);
        setTenantProfile(data);
        if (data.onboarded) {
          setShowWizard(false);
          setSkippedWizard(false);
        } else {
          const bypassed = data.skipped_wizard || localStorage.getItem('enrollai_skipped_wizard') === 'true';
          if (bypassed) {
            setShowWizard(false);
            setSkippedWizard(true);
          } else {
            setShowWizard(true);
          }
        }
      } else {
        localStorage.removeItem('enrollai_session_token');
        setIsLoggedIn(false);
        setTenantProfile(null);
      }
    } catch (err) {
      console.error('Session handshaking error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial datasets from server database
  const loadData = async () => {
    setLoading(true);
    try {
      // Profile Status
      const tenantRes = await authFetch('/api/tenant/me');
      if (tenantRes.ok) {
        const tenantData = await tenantRes.json();
        setTenantProfile(tenantData);
      }

      // Leads
      const leadsRes = await authFetch('/api/leads');
      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setLeads(data);
      }
      
      // Conversations
      const convRes = await authFetch('/api/conversations');
      if (convRes.ok) {
        const data = await convRes.json();
        setConversations(data);
        if (data.length > 0 && !selectedConvId) {
          setSelectedConvId(data[0].id);
        }
      }

      // Appointments
      const apptRes = await authFetch('/api/appointments');
      if (apptRes.ok) {
        const data = await apptRes.json();
        setAppointments(data);
      }

      // Course Programs
      const progRes = await authFetch('/api/programs');
      if (progRes.ok) {
        const data = await progRes.json();
        setPrograms(data);
      }

      // Widget settings config parameters
      const cfgRes = await authFetch('/api/widget/config');
      if (cfgRes.ok) {
        const c = await cfgRes.json();
        setCfgBotName(c.botName || 'Horizon AI Advisor');
        setCfgWelcomeMessage(c.welcomeMessage || '');
        setCfgLeadCapture(c.leadCaptureEnabled !== false);
        setCfgBooking(c.bookingEnabled !== false);
        setCfgHandoff(c.humanHandoffEnabled !== false);
        setCfgConfidence(c.confidenceDisplayEnabled !== false);
        setCfgWhatsApp(c.whatsappEnabled !== false);
        setCfgWhatsAppNumber(c.whatsappNumber || '+237 690 000 000');
        setCfgTimeTrigger(c.timeTriggerEnabled !== false);
        setCfgTimeDelay(c.timeTriggerDelay || 6);
        setCfgScrollTrigger(c.scrollTriggerEnabled !== false);
        setCfgScrollPercent(c.scrollTriggerPercent || 50);
        setCfgExitIntent(c.exitIntentEnabled !== false);
        setCfgIdleTrigger(c.idleTriggerEnabled !== false);
        setCfgPosition(c.position || 'right_bottom');
        setCfgLauncherEmoji(c.launcherEmoji || '🎓');
        setCfgPulseEnabled(c.pulseEnabled !== false);
        setCfgCustomAccent(c.customAccent || '');
        if (c.theme) {
          setThemeById(c.theme);
        }
      }
    } catch (err) {
      console.warn('Backend is initializing, offline layout fallback is enabled.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  // Handle widget config save action
  const handleSaveConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaveStatus('saving');
    try {
      await authFetch('/api/widget/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botName: cfgBotName,
          welcomeMessage: cfgWelcomeMessage,
          leadCaptureEnabled: cfgLeadCapture,
          bookingEnabled: cfgBooking,
          humanHandoffEnabled: cfgHandoff,
          confidenceDisplayEnabled: cfgConfidence,
          whatsappEnabled: cfgWhatsApp,
          whatsappNumber: cfgWhatsAppNumber,
          timeTriggerEnabled: cfgTimeTrigger,
          timeTriggerDelay: cfgTimeDelay,
          scrollTriggerEnabled: cfgScrollTrigger,
          scrollTriggerPercent: cfgScrollPercent,
          exitIntentEnabled: cfgExitIntent,
          idleTriggerEnabled: cfgIdleTrigger,
          position: cfgPosition,
          launcherEmoji: cfgLauncherEmoji,
          pulseEnabled: cfgPulseEnabled,
          theme: activeTheme.id,
          customAccent: cfgCustomAccent
        })
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err) {
      console.error(err);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1500);
    }
  };

  // Auto-save configuration on change and dispatch live local update
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const configData = {
      botName: cfgBotName,
      welcomeMessage: cfgWelcomeMessage,
      leadCaptureEnabled: cfgLeadCapture,
      bookingEnabled: cfgBooking,
      humanHandoffEnabled: cfgHandoff,
      confidenceDisplayEnabled: cfgConfidence,
      whatsappEnabled: cfgWhatsApp,
      whatsappNumber: cfgWhatsAppNumber,
      timeTriggerEnabled: cfgTimeTrigger,
      timeTriggerDelay: cfgTimeDelay,
      scrollTriggerEnabled: cfgScrollTrigger,
      scrollTriggerPercent: cfgScrollPercent,
      exitIntentEnabled: cfgExitIntent,
      idleTriggerEnabled: cfgIdleTrigger,
      position: cfgPosition,
      launcherEmoji: cfgLauncherEmoji,
      pulseEnabled: cfgPulseEnabled,
      theme: activeTheme.id,
      customAccent: cfgCustomAccent
    };

    // Dispatch custom event for real-time widget update on same page
    window.dispatchEvent(new CustomEvent('enrollai-widget-config-live', { detail: configData }));

    // Debounce save to database to prevent heavy spamming on typing
    const saveTimer = setTimeout(async () => {
      try {
        await authFetch('/api/widget/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(configData)
        });
      } catch (err) {
        console.warn('Auto-save network error', err);
      }
    }, 800);

    return () => clearTimeout(saveTimer);
  }, [
    cfgBotName, cfgWelcomeMessage, cfgLeadCapture, cfgBooking, cfgHandoff,
    cfgConfidence, cfgWhatsApp, cfgWhatsAppNumber, cfgTimeTrigger, cfgTimeDelay,
    cfgScrollTrigger, cfgScrollPercent, cfgExitIntent, cfgIdleTrigger, cfgPosition,
    cfgLauncherEmoji, cfgPulseEnabled, activeTheme.id, cfgCustomAccent, isLoggedIn
  ]);

  const handleNavClick = (tabKey: any) => {
    setActiveTab(tabKey);
    setMobileMenuOpen(false);
  };

  const handleToggleChecklistStep = (id: number) => {
    setChecklistSteps(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  // Shared Inbox active conversational operations
  const activeConversation = conversations.find(c => c.id === selectedConvId);

  const handleHijackTakeover = async (id: string) => {
    try {
      const res = await authFetch(`/api/conversations/${id}/takeover`, { method: 'POST' });
      if (res.ok) {
        const body = await res.json();
        setConversations(prev => prev.map(c => c.id === id ? { ...c, status: body.status } : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendAgentReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentReplyText.trim() || !selectedConvId) return;

    try {
      const res = await authFetch(`/api/conversations/${selectedConvId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: agentReplyText, role: 'AGENT' })
      });
      if (res.ok) {
        const msg = await res.json();
        setConversations(prev => prev.map(c => {
          if (c.id === selectedConvId) {
            return {
              ...c,
              messages: [...c.messages, msg],
              unreadCount: 0
            };
          }
          return c;
        }));
        setAgentReplyText('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Leads CRUD
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName || !newLeadEmail) return;

    try {
      const res = await authFetch('/api/widget/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newLeadName,
          email: newLeadEmail,
          phone: newLeadPhone,
          country: newLeadCountry,
          programInterest: newLeadProgram
        })
      });
      if (res.ok) {
        const created = await res.json();
        // Since `/api/widget/lead` returns onboarding response, let's trigger reload
        await loadData();
        setShowAddLeadModal(false);
        setNewLeadName('');
        setNewLeadEmail('');
        setNewLeadPhone('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      await authFetch(`/api/leads/${id}`, { method: 'DELETE' });
      setLeads(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Programs CRUD
  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgName) return;

    try {
      const res = await authFetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProgName,
          department: newProgDept,
          duration: newProgDuration,
          fees: newProgFees,
          capacityBadge: newProgBadge,
          description: newProgDesc
        })
      });
      if (res.ok) {
        const item = await res.json();
        setPrograms(v => [...v, item]);
        setShowAddProgModal(false);
        setNewProgName('');
        setNewProgDesc('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProgram = async (id: string) => {
    try {
      await authFetch(`/api/programs/${id}`, { method: 'DELETE' });
      setPrograms(v => v.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Filter leads matches search and categories
  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.fullName.toLowerCase().includes(leadQuery.toLowerCase()) || 
                          l.email.toLowerCase().includes(leadQuery.toLowerCase()) || 
                          l.country.toLowerCase().includes(leadQuery.toLowerCase());
    const matchesFilter = activeLeadFilter === 'ALL' || l.status === activeLeadFilter;
    return matchesSearch && matchesFilter;
  });

  // Calculate quick indicators
  const totalLeadsCount = leads.length;
  const hotLeadsCount = leads.filter(l => l.status === 'HOT').length;
  const convertedLeadsCount = leads.filter(l => l.status === 'CONVERTED').length;

  // LANDING PAGE SCREEN VIEW
  if (!isLoggedIn && !showWizard) {
    if (showAuth) {
      return (
        <div id="auth_wrapper" className="min-h-screen flex items-center justify-center relative transition-colors duration-300" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
          <AuthPage 
            initialMode={authInitialMode}
            onSuccess={(token, email) => {
              localStorage.setItem('enrollai_session_token', token);
              localStorage.setItem('enrollai_email', email);
              setShowAuth(false);
              checkUserSession(token);
            }}
            onCancel={() => {
              setShowAuth(false);
            }}
          />
          <FloatingWidget />
        </div>
      );
    }

    return (
      <div id="landing_wrapper">
        <LandingPage 
          onStartDemo={() => {
            setAuthInitialMode('signup');
            setShowAuth(true);
          }}
          onLogin={() => {
            setAuthInitialMode('login');
            setShowAuth(true);
          }}
        />
        <FloatingWidget />
      </div>
    );
  }

  // ONBOARDING 8-STEP WIZARD VIEW
  if (showWizard) {
    return (
      <div id="wizard_wrapper">
        <OnboardingWizard 
          onSkip={async () => {
            localStorage.setItem('enrollai_skipped_wizard', 'true');
            localStorage.setItem('enrollai_dismissed_setup_popup', 'true');
            setSkippedWizard(true);
            setShowWizard(false);
            const token = localStorage.getItem('enrollai_session_token');
            try {
              await fetch('/api/tenant/skip', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': token ? `Bearer ${token}` : ''
                }
              });
            } catch (err) {
              console.error('Failed to skip onboarding on server:', err);
            }
          }}
          onComplete={async (themeId, wizardBotName, vertical, scraped) => {
            const token = localStorage.getItem('enrollai_session_token');
            try {
              await fetch('/api/tenant/onboard', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({
                  botName: wizardBotName,
                  primaryColor: '#6366F1',
                  welcomeMessage: cfgWelcomeMessage || 'Hello! Choose an option or query our interactive assistant.',
                  plan: 'Starter',
                  theme: themeId,
                  vertical: vertical,
                  scraped: scraped
                })
              });
            } catch (err) {
              console.error('Onboarding submission failed:', err);
            }
            localStorage.removeItem('enrollai_skipped_wizard');
            setSkippedWizard(false);
            setShowWizard(false);
            setIsLoggedIn(true);
            setActiveTab('dashboard');
            loadData();
          }}
        />
        <FloatingWidget />
      </div>
    );
  }

  // Show a beautiful, high-contrast theme-adaptive loader to prevent sudden splashes or race conditions on initialization
  if (isLoggedIn && loading) {
    return (
      <div 
        className="min-h-screen w-full flex flex-col items-center justify-center p-6 transition-colors duration-300"
        style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
      >
        <div className="flex flex-col items-center max-w-sm w-full text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/15 animate-ping duration-1000" />
            <div className="p-5 rounded-2xl text-white flex items-center justify-center shadow-lg animate-spin" style={{ background: 'var(--accent-gradient)', animationDuration: '3s' }}>
              <RefreshCcw className="w-8 h-8" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold tracking-tight">Synchronizing Admissions Cloud</h3>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Retrieving student insights, conversational histories, and school guidelines securely...
            </p>
          </div>

          <div className="w-full space-y-3 pt-4 opacity-40">
            <div className="h-4 w-2/3 rounded-md bg-zinc-500/30 mx-auto animate-pulse" />
            <div className="h-10 w-full rounded-xl bg-zinc-500/20 animate-pulse" />
            <div className="h-20 w-full rounded-2xl bg-zinc-500/20 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // COMPREHENSIVE B2B SAAS PORTAL VIEW
  return (
    <div id="saas_dashboard_root" className="min-h-screen flex flex-col md:flex-row transition-colors duration-300 relative" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
      
      {/* Mobile/Tablet Top Sticky Navigation Bar */}
      <div className="flex md:hidden items-center justify-between px-5 py-3.5 border-b shrink-0 z-40 sticky top-0" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl text-white flex items-center justify-center shadow shadow-accent" style={{ background: 'var(--accent-gradient)' }}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-extrabold tracking-tight block">Enroll<span style={{ color: 'var(--color-accent)' }}>AI</span></span>
          </div>
        </div>
        
        <button 
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="p-1 px-3 text-[10px] uppercase tracking-wider font-extrabold border rounded-xl transition cursor-pointer flex items-center gap-1.5"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}
        >
          <span>{mobileMenuOpen ? 'Close Menu' : 'Open Menu'}</span>
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Backdrop Overlay for Mobile Drawer */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-fade-in" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar Navigation Drawer */}
      <aside 
        className={`fixed inset-y-0 left-0 w-64 border-r shrink-0 flex flex-col justify-between z-50 transition-transform duration-300 md:relative md:translate-x-0 md:flex h-full
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `} 
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}
      >
        
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo brand */}
          <div className="p-6 border-b flex items-center gap-2" style={{ borderBottomColor: 'var(--color-border)' }}>
            <div className="p-2.5 rounded-xl text-white flex items-center justify-center shadow shadow-accent" style={{ background: 'var(--accent-gradient)' }}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight block">Enroll<span className="text-accent underline decoration-wavy" style={{ color: 'var(--color-accent)' }}>AI</span></span>
              <span className="text-[9px] font-bold text-neutral-400 block tracking-widest uppercase mt-0.5">Admissions Portal</span>
            </div>
          </div>

          {/* User profile identifier block - adapted beautifully to selected themes */}
          <div 
            onClick={() => handleNavClick('profile')}
            className="p-4 border-b flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity" 
            style={{ borderBottomColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}
            title="View Profile Settings"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center font-extrabold text-sm border shadow-inner shrink-0" style={{ backgroundColor: 'var(--color-border)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
              {tenantProfile?.profile_image_url ? (
                <img 
                  src={tenantProfile.profile_image_url} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                (tenantProfile?.name || tenantProfile?.email || 'E').charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="text-xs font-black leading-none truncate" style={{ color: 'var(--color-text-primary)' }}>
                {tenantProfile?.name || 'Emmanuel J.'}
              </h5>
              <span className="text-[9px] font-bold uppercase font-mono block mt-1 truncate" style={{ color: 'var(--color-text-secondary)' }}>
                Org Owner • {tenantProfile?.email ? tenantProfile.email.split('@')[0] : 'Cameroun'}
              </span>
            </div>
          </div>

          {/* Standard Navigation tabs lists with dynamic highlight matching */}
          <div className="p-4 space-y-1 select-none">
            
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer`}
              style={activeTab === 'dashboard' ? { backgroundColor: 'var(--nav-active-bg)', color: 'var(--nav-active-text)' } : { color: 'var(--color-text-secondary)' }}
            >
              <Compass className="w-4.5 h-4.5 shrink-0" />
              <span>{translate('dashboard')}</span>
            </button>

            <button
              onClick={() => handleNavClick('leads')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer`}
              style={activeTab === 'leads' ? { backgroundColor: 'var(--nav-active-bg)', color: 'var(--nav-active-text)' } : { color: 'var(--color-text-secondary)' }}
            >
              <Users className="w-4.5 h-4.5 shrink-0" />
              <span>{translate('leads')}</span>
              <span className="ml-auto bg-neutral-100 text-neutral-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full font-mono">{leads.length}</span>
            </button>

            <button
              onClick={() => handleNavClick('conversations')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer`}
              style={activeTab === 'conversations' ? { backgroundColor: 'var(--nav-active-bg)', color: 'var(--nav-active-text)' } : { color: 'var(--color-text-secondary)' }}
            >
              <MessageSquare className="w-4.5 h-4.5 shrink-0" />
              <span>{translate('conversations')}</span>
              {conversations.filter(c => (c.unreadCount || 0) > 0).length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full font-mono">
                  {conversations.filter(c => (c.unreadCount || 0) > 0).length} unread
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('kb')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer`}
              style={activeTab === 'kb' ? { backgroundColor: 'var(--nav-active-bg)', color: 'var(--nav-active-text)' } : { color: 'var(--color-text-secondary)' }}
            >
              <Database className="w-4.5 h-4.5 shrink-0" />
              <span>{translate('knowledgeBase')}</span>
            </button>

            <button
              onClick={() => handleNavClick('programs')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer`}
              style={activeTab === 'programs' ? { backgroundColor: 'var(--nav-active-bg)', color: 'var(--nav-active-text)' } : { color: 'var(--color-text-secondary)' }}
            >
              <BookOpen className="w-4.5 h-4.5 shrink-0" />
              <span>{translate('programs')}</span>
            </button>

            <button
              onClick={() => handleNavClick('appointments')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer`}
              style={activeTab === 'appointments' ? { backgroundColor: 'var(--nav-active-bg)', color: 'var(--nav-active-text)' } : { color: 'var(--color-text-secondary)' }}
            >
              <CalendarIcon className="w-4.5 h-4.5 shrink-0" />
              <span>{translate('appointments')}</span>
            </button>

            <button
              onClick={() => handleNavClick('reports')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer`}
              style={activeTab === 'reports' ? { backgroundColor: 'var(--nav-active-bg)', color: 'var(--nav-active-text)' } : { color: 'var(--color-text-secondary)' }}
            >
              <BarChart3 className="w-4.5 h-4.5 shrink-0" />
              <span>{translate('reports')}</span>
            </button>

            <button
              onClick={() => handleNavClick('widget_config')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer`}
              style={activeTab === 'widget_config' ? { backgroundColor: 'var(--nav-active-bg)', color: 'var(--nav-active-text)' } : { color: 'var(--color-text-secondary)' }}
            >
              <Settings className="w-4.5 h-4.5 shrink-0" />
              <span>{translate('widgetConfig')}</span>
            </button>

            <button
              onClick={() => handleNavClick('billing')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer`}
              style={activeTab === 'billing' ? { backgroundColor: 'var(--nav-active-bg)', color: 'var(--nav-active-text)' } : { color: 'var(--color-text-secondary)' }}
            >
              <CreditCard className="w-4.5 h-4.5 shrink-0" />
              <span>{translate('billing')}</span>
            </button>

            <button
              onClick={() => handleNavClick('team')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer`}
              style={activeTab === 'team' ? { backgroundColor: 'var(--nav-active-bg)', color: 'var(--nav-active-text)' } : { color: 'var(--color-text-secondary)' }}
            >
              <Users className="w-4.5 h-4.5 shrink-0" />
              <span>Team Members</span>
            </button>

            <button
              onClick={() => handleNavClick('setup_wizard')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer`}
              style={activeTab === 'setup_wizard' ? { backgroundColor: 'var(--nav-active-bg)', color: 'var(--nav-active-text)' } : { color: 'var(--color-text-secondary)' }}
            >
              <div className="flex items-center gap-2.5">
                <Wand2 className="w-4.5 h-4.5 shrink-0" />
                <span>Setup Wizard</span>
              </div>
              {tenantProfile?.onboarded !== 1 ? (
                <span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 font-mono shrink-0">
                  Todo
                </span>
              ) : (
                <span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-mono shrink-0">
                  Done
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('profile')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer`}
              style={activeTab === 'profile' ? { backgroundColor: 'var(--nav-active-bg)', color: 'var(--nav-active-text)' } : { color: 'var(--color-text-secondary)' }}
            >
              <User className="w-4.5 h-4.5 shrink-0" />
              <span>User Profile</span>
            </button>
          </div>
        </div>

        {/* Global togglers & Logout */}
        <div className="p-4 border-t space-y-3" style={{ borderTopColor: 'var(--color-border)' }}>
          {/* Theme switcher */}
          <div className="flex rounded-lg p-1 text-xs font-semibold border items-center justify-between" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <span className="text-[10px] pl-2 font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Theme</span>
            <select
              value={activeTheme.id}
              onChange={(e) => setThemeById(e.target.value as ThemeId)}
              className="bg-transparent rounded px-1.5 py-0.5 text-[10px] uppercase font-mono font-bold focus:outline-none cursor-pointer"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {Object.entries(THEMES).map(([id, t]) => (
                <option key={id} value={id} style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Language Switcher */}
          <div className="flex rounded-lg p-1 text-xs font-semibold border items-center justify-between" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <span className="text-[10px] pl-2 font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Language</span>
            <div className="flex gap-1">
              <button
                onClick={() => setIsLanguage('en')}
                className="px-2 py-0.5 rounded text-[10px] font-black uppercase transition-all cursor-pointer"
                style={activeLanguage === 'en' 
                  ? { backgroundColor: 'var(--color-accent)', color: '#FFFFFF' } 
                  : { color: 'var(--color-text-secondary)' }
                }
              >
                EN
              </button>
              <button
                onClick={() => setIsLanguage('fr')}
                className="px-2 py-0.5 rounded text-[10px] font-black uppercase transition-all cursor-pointer"
                style={activeLanguage === 'fr' 
                  ? { backgroundColor: 'var(--color-accent)', color: '#FFFFFF' } 
                  : { color: 'var(--color-text-secondary)' }
                }
              >
                FR
              </button>
            </div>
          </div>

          <button 
            onClick={() => {
              localStorage.removeItem('enrollai_session_token');
              localStorage.removeItem('enrollai_email');
              localStorage.removeItem('enrollai_skipped_wizard');
              localStorage.removeItem('enrollai_dismissed_setup_popup');
              setSkippedWizard(false);
              setIsLoggedIn(false);
              setShowWizard(false);
            }}
            className="w-full px-4 py-2 text-xs font-bold rounded-lg text-left transition flex items-center gap-2 cursor-pointer border"
            style={{ 
              borderColor: 'var(--color-border)', 
              backgroundColor: 'var(--color-bg-card)', 
              color: 'var(--color-text-secondary)' 
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = 'var(--color-text-primary)';
              e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = 'var(--color-text-secondary)';
              e.currentTarget.style.backgroundColor = 'var(--color-bg-card)';
            }}
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" style={{ color: 'var(--color-text-secondary)' }} />
            <span>Go to Landing Page</span>
          </button>
        </div>

      </aside>

      {/* Main Page Area Container */}
      <main className="flex-1 overflow-y-auto px-6 py-8">
        
        {/* Onboarding Setup checklist conditional display layout progress indicator */}
        {activeTab === 'dashboard' && showChecklist && (
          <OnboardingChecklist 
            steps={checklistSteps}
            onToggleStep={handleToggleChecklistStep}
            onDismiss={() => setShowChecklist(false)}
            onNavigateTab={(tabKey) => setActiveTab(tabKey)}
          />
        )}

        {/* TAB 1: Dashboard overview stats indicators */}
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6" style={{ color: 'var(--color-text-primary)' }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
              <div>
                <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Horizon Admissions Officer Panel</h1>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Track real-time candidate leads, AI confidence indexes, and scheduled orientation counseling appointments.</p>
              </div>

              {/* Language Switch */}
              <div className="flex bg-zinc-100 rounded-lg p-0.5 text-xs font-semibold border border-zinc-200 self-start shrink-0">
                <button
                  onClick={() => setIsLanguage('en')}
                  className={`px-3 py-1 rounded-md transition-all ${activeLanguage === 'en' ? 'bg-white shadow text-neutral-900' : 'text-neutral-500'}`}
                >
                  English
                </button>
                <button
                  onClick={() => setIsLanguage('fr')}
                  className={`px-3 py-1 rounded-md transition-all ${activeLanguage === 'fr' ? 'bg-white shadow text-neutral-900' : 'text-neutral-500'}`}
                >
                  Français
                </button>
              </div>
            </div>

            {/* Trial Quota status and update plan */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-pulse">
              <div className="flex gap-2.5 items-start text-xs text-amber-950">
                <Shield className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-extrabold">{translate('trialActive', { days: '12' })}</h5>
                  <p className="text-[10px] text-amber-700 font-medium">Capture student parameters, configure custom scrapers, and schedule video orientation slots.</p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('billing')}
                className="px-4 py-2 border rounded-xl bg-white border-amber-300 text-amber-950 text-xs font-bold transition shadow-sm hover:bg-neutral-50 shrink-0 self-start cursor-pointer"
              >
                {translate('upgradeNow')}
              </button>
            </div>

            {/* KPI statistics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border rounded-2xl p-5 shadow-sm space-y-2" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <span className="text-[10px] font-bold block uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Total Captured Leads</span>
                <span className="text-3xl font-black block font-mono" style={{ color: 'var(--color-text-primary)' }}>{leads.length}</span>
                <span className="text-[10px] block font-medium leading-normal break-words" style={{ color: 'var(--color-text-secondary)' }}>Captured from Cameroon, Nigeria, Canada</span>
              </div>

              <div className="border rounded-2xl p-5 shadow-sm space-y-2" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <span className="text-[10px] font-bold block uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>High Rating HOT Prospects</span>
                <span className="text-3xl font-black block font-mono" style={{ color: 'var(--color-accent)' }}>{hotLeadsCount} leads</span>
                <span className="text-[10px] font-bold inline-block rounded-md px-2 py-0.5 max-w-max text-center break-words" style={{ color: 'var(--badge-text)', backgroundColor: 'var(--badge-bg)' }}>
                  ★ Active Orientation Candidate
                </span>
              </div>

              <div className="border rounded-2xl p-5 shadow-sm space-y-2" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <span className="text-[10px] font-bold block uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Active schedules</span>
                <span className="text-3xl font-black block font-mono leading-tight" style={{ color: 'var(--color-text-primary)' }}>{appointments.length} confirmed</span>
                <span className="text-[10px] block font-medium leading-normal break-words" style={{ color: 'var(--color-text-secondary)' }}>Pending campus & video integrations</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Confirmed Appointments list ledger */}
              <div className="lg:col-span-6 border rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
                    <CalendarIcon className="w-4.5 h-4.5 text-accent" style={{ color: 'var(--color-accent)' }} />
                    <span>Admissions Interventions Ledger</span>
                  </h3>
                  <button onClick={() => setActiveTab('appointments')} className="text-[10px] font-extrabold text-accent hover:underline" style={{ color: 'var(--color-accent)' }}>
                    See all
                  </button>
                </div>

                <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                  {appointments.slice(0, 3).map((appt) => (
                    <div key={appt.id} className="py-4 flex justify-between items-center text-xs first:pt-0 last:pb-0" style={{ borderBottomColor: 'var(--color-border)' }}>
                      <div className="space-y-0.5">
                        <span className="font-extrabold block" style={{ color: 'var(--color-text-primary)' }}>{appt.leadName}</span>
                        <span className="text-[10px] block" style={{ color: 'var(--color-text-secondary)' }}>{appt.program}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-[11px] block" style={{ color: 'var(--color-text-primary)' }}>{appt.date} @ {appt.time}</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 font-mono" style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)' }}>
                          {appt.type} CONFIRMED
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent hot leads lists */}
              <div className="lg:col-span-6 border rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
                    <Users className="w-4.5 h-4.5 text-accent" style={{ color: 'var(--color-accent)' }} />
                    <span>Recent Student Leads Captured</span>
                  </h3>
                  <button onClick={() => setActiveTab('leads')} className="text-[10px] font-extrabold text-accent hover:underline" style={{ color: 'var(--color-accent)' }}>
                    Manager Leads
                  </button>
                </div>

                <div className="space-y-3">
                  {leads.slice(0, 4).map((l) => (
                    <div key={l.id} className="p-3 border rounded-xl flex items-center justify-between hover:opacity-85 transition-colors" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                      <div className="space-y-0.5">
                        <span className="font-bold block" style={{ color: 'var(--color-text-primary)' }}>{l.fullName}</span>
                        <span className="text-[10px] block font-mono" style={{ color: 'var(--color-text-secondary)' }}>{l.email} • {l.country}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full" style={l.status === 'HOT' ? { backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)' } : l.status === 'CONVERTED' ? { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' } : { backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-secondary)' }}>
                        {l.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Simulated Live Embed status warning indicator */}
            <div className="p-5 bg-zinc-900 text-zinc-100 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-start gap-3 w-full lg:w-auto">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center animate-spin-slow shrink-0 mt-0.5 lg:mt-0">
                  <Compass className="w-5 h-5 text-[#FF5C3A]" style={{ color: 'var(--color-accent)' }} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold">Copy widget snippet tag for school theme integration</h4>
                  <p className="text-[10px] text-neutral-400 leading-normal">You can inspect live clicks, interaction matrices, and triggers synced into your dashboard once embeded.</p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('widget_config')}
                className="px-4 py-2.5 rounded-xl text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer w-full lg:w-auto justify-center hover:opacity-90 active:scale-98"
                style={{ background: 'var(--accent-gradient)' }}
              >
                <span>Embed Code</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </motion.div>
        )}

        {/* TAB 2: Leads management screen */}
        {activeTab === 'leads' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Student Leads Directory</h1>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>View detailed application intent scores, country metrics, and schedule recruiter calls.</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddLeadModal(true)}
                  className="px-4 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 transition shadow cursor-pointer shadow-accent"
                  style={{ background: 'var(--accent-gradient)' }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Manual Insert</span>
                </button>
              </div>
            </div>

            {/* Filter toolbars lists */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border p-4 rounded-2xl shadow-sm" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-1.5 self-start md:self-auto text-xs font-bold select-none overflow-x-auto w-full md:w-auto" style={{ color: 'var(--color-text-secondary)' }}>
                <button
                  onClick={() => setActiveLeadFilter('ALL')}
                  className="px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
                  style={activeLeadFilter === 'ALL' ? { backgroundColor: 'var(--color-accent)', color: 'white' } : { color: 'var(--color-text-secondary)' }}
                >
                  All Leads ({leads.length})
                </button>
                <button
                  onClick={() => setActiveLeadFilter('HOT')}
                  className="px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
                  style={activeLeadFilter === 'HOT' ? { backgroundColor: 'var(--color-accent)', color: 'white' } : { color: 'var(--color-text-secondary)' }}
                >
                  HOT ({leads.filter(l => l.status === 'HOT').length})
                </button>
                <button
                  onClick={() => setActiveLeadFilter('CONVERTED')}
                  className="px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
                  style={activeLeadFilter === 'CONVERTED' ? { backgroundColor: 'var(--color-accent)', color: 'white' } : { color: 'var(--color-text-secondary)' }}
                >
                  Converted ({leads.filter(l => l.status === 'CONVERTED').length})
                </button>
                <button
                  onClick={() => setActiveLeadFilter('COLD')}
                  className="px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
                  style={activeLeadFilter === 'COLD' ? { backgroundColor: 'var(--color-accent)', color: 'white' } : { color: 'var(--color-text-secondary)' }}
                >
                  Cold ({leads.filter(l => l.status === 'COLD').length})
                </button>
              </div>

              {/* Local search indicator */}
              <div className="relative w-full md:w-72 shrink-0">
                <Search className="absolute left-3 top-2.5 w-4.5 h-4.5" style={{ color: 'var(--color-text-secondary)' }} />
                <input
                  type="text"
                  value={leadQuery}
                  onChange={(e) => setLeadQuery(e.target.value)}
                  placeholder="Search name, country or email..."
                  className="w-full border pl-9 pr-4 py-2 rounded-xl text-xs focus:bg-white outline-none focus:ring-1 focus:ring-accent"
                  style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', '--tw-ring-color': 'var(--color-accent)' } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Table layout of leads */}
            <div className="border rounded-2xl shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b font-bold" style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottomColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                      <th className="px-4 py-3">{translate('fullNameField')}</th>
                      <th className="px-4 py-3">RAG Score</th>
                      <th className="px-4 py-3">Origin</th>
                      <th className="px-4 py-3">Program Level</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ divideColor: 'var(--color-border)' }}>
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-neutral-400 italic">No prospective candidate match standard query.</td>
                      </tr>
                    ) : (
                      filteredLeads.map((l) => (
                        <tr key={l.id} className="hover:opacity-85 transition-all">
                          <td className="px-4 py-4 leading-normal">
                            <span className="font-extrabold block" style={{ color: 'var(--color-text-primary)' }}>{l.fullName}</span>
                            <span className="text-[10px] text-neutral-400 block font-mono">{l.email} • {l.phone}</span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`w-3.5 h-3.5 block rounded-full ${l.status === 'HOT' ? 'bg-red-500 animate-pulse' : l.status === 'CONVERTED' ? 'bg-emerald-500' : 'bg-neutral-300'}`}></span>
                              <div>
                                <span className="font-black block font-mono" style={{ color: 'var(--color-text-primary)' }}>{l.score}% rating</span>
                                <span className="text-[9px] block font-serif uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>{l.status}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                            {l.city ? `${l.city}, ` : ''}{l.country}
                          </td>
                          <td className="px-4 py-4 font-bold max-w-[200px] truncate" style={{ color: 'var(--color-text-secondary)' }}>
                            {l.programInterest}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={() => handleDeleteLead(l.id)}
                              className="p-1 px-2.5 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer text-[10px] font-bold inline-flex items-center gap-1"
                            >
                              <Trash className="w-3" />
                              <span>Archive</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MANUAL MANAGE LEADS POPUP MODAL */}
            {showAddLeadModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 text-neutral-800 animate-fade-in">
                <div className="border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black uppercase" style={{ color: 'var(--color-text-primary)' }}>Insert Prospective Candidate Manual</h3>
                    <button onClick={() => setShowAddLeadModal(false)} className="hover:opacity-80 transition cursor-pointer" style={{ color: 'var(--color-text-secondary)' }}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateLead} className="space-y-3 pt-2 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Candidate Name</label>
                      <input
                        type="text"
                        required
                        value={newLeadName}
                        onChange={(e) => setNewLeadName(e.target.value)}
                        placeholder="e.g. Jean-Pierre Mvondo"
                        className="w-full border rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-accent"
                        style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', '--tw-ring-color': 'var(--color-accent)' } as React.CSSProperties}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Email address</label>
                      <input
                        type="email"
                        required
                        value={newLeadEmail}
                        onChange={(e) => setNewLeadEmail(e.target.value)}
                        placeholder="e.g. jp.mvondo@univ.cm"
                        className="w-full border rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-accent"
                        style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', '--tw-ring-color': 'var(--color-accent)' } as React.CSSProperties}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Phone number</label>
                      <input
                        type="text"
                        value={newLeadPhone}
                        onChange={(e) => setNewLeadPhone(e.target.value)}
                        placeholder="e.g. +237 670 12 34 56"
                        className="w-full border rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-accent"
                        style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', '--tw-ring-color': 'var(--color-accent)' } as React.CSSProperties}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Country</label>
                        <input
                          type="text"
                          value={newLeadCountry}
                          onChange={(e) => setNewLeadCountry(e.target.value)}
                          className="w-full border rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-accent"
                          style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', '--tw-ring-color': 'var(--color-accent)' } as React.CSSProperties}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Target Program</label>
                        <select
                          value={newLeadProgram}
                          onChange={(e) => setNewLeadProgram(e.target.value)}
                          className="w-full border rounded-xl px-2 py-2 outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                          style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', '--tw-ring-color': 'var(--color-accent)' } as React.CSSProperties}
                        >
                          <option>Executive MBA (EN/FR)</option>
                          <option>B.Sc. Software Engineering with Applied AI</option>
                          <option>Master in Global Public Health</option>
                          <option>Diploma in Hospitality & Tourism Excellence</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-4 font-bold text-xs">
                      <button
                        type="button"
                        onClick={() => setShowAddLeadModal(false)}
                        className="px-4 py-2 border rounded-xl hover:opacity-85 cursor-pointer"
                        style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-xl text-white transition shadow cursor-pointer hover:opacity-90"
                        style={{ background: 'var(--accent-gradient)' }}
                      >
                        Save Student
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </motion.div>
        )}

        {/* TAB 3: Shared Inbox Conversations and hijack TakeOver */}
        {activeTab === 'conversations' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6 h-[calc(100vh-140px)] flex flex-col justify-between">
            <div>
              <h1 className="text-xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Conversational Takeovers & Hijack Inbox</h1>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Monitor incoming RAG chats in real-time. Hit "Takeover AI" to hijack counseling loops if students need complex advising.</p>
            </div>

            <div className="flex-1 mt-4 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-hidden min-h-0 items-stretch border rounded-3xl shadow-sm" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              
              {/* Conversations sidebar selector column */}
              <div className="md:col-span-4 border-r overflow-y-auto divide-y divide-zinc-100 flex flex-col h-full" style={{ borderColor: 'var(--color-border)' }}>
                {conversations.length === 0 ? (
                  <div className="p-6 text-center text-neutral-400 italic text-xs">No active counseling chats today.</div>
                ) : (
                  conversations.map((conv) => {
                    const matchedLead = leads.find(l => l.id === conv.leadId);
                    const nameLabel = matchedLead ? matchedLead.fullName : `Visitor ${conv.sessionId.slice(-6)}`;
                    const isSelected = conv.id === selectedConvId;

                    return (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConvId(conv.id)}
                        className={`p-4 text-left transition cursor-pointer select-none relative flex flex-col gap-1.5 ${isSelected ? 'bg-zinc-50 border-r-4 border-accent' : 'hover:bg-neutral-50'}`}
                        style={isSelected ? { borderRightColor: 'var(--color-accent)' } : undefined}
                      >
                        {/* Unread dot count indicator badge */}
                        {(conv.unreadCount || 0) > 0 && (
                          <span className="absolute top-4 right-4 bg-red-505 w-2 h-2 rounded-full bg-red-500 ring-4 ring-red-50"></span>
                        )}

                        <div className="flex justify-between items-baseline pr-4">
                          <span className="font-extrabold text-xs text-neutral-950 truncate max-w-[150px]">{nameLabel}</span>
                          <span className="text-[9px] font-mono text-zinc-400 font-bold">{conv.sentiment.toUpperCase()}</span>
                        </div>

                        <p className="text-[10px] text-neutral-500 line-clamp-1 pr-6">
                          {conv.messages[conv.messages.length - 1]?.content}
                        </p>

                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`text-[9px] font-mono font-black border text-neutral-700 px-2 py-0.5 rounded ${conv.status === 'ESCALATED' ? 'bg-red-50 text-red-650 border-red-200' : conv.status === 'CLOSED' ? 'bg-stone-100 text-stone-600' : 'bg-emerald-50 text-emerald-800'}`}>
                            {conv.status}
                          </span>
                          <span className="text-[8px] font-mono text-neutral-400">Wait: 48s</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Central messages panel hijack board console column */}
              <div className="md:col-span-8 flex flex-col h-full overflow-hidden">
                {activeConversation ? (
                  <div className="flex-1 flex flex-col overflow-hidden h-full">
                    
                    {/* Console Header details */}
                    <div className="px-5 py-4 border-b bg-stone-50 flex items-center justify-between shadow-sm shrink-0" style={{ borderBottomColor: 'var(--color-border)' }}>
                      <div>
                        <h4 className="font-bold text-xs text-neutral-950">
                          Interactive Session {activeConversation.sessionId}
                        </h4>
                        <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-medium">
                          <span className="font-bold">Chat status:</span>
                          <span className="font-mono text-accent" style={{ color: 'var(--color-accent)' }}>{activeConversation.status}</span>
                        </div>
                      </div>

                      {activeConversation.status !== 'CLOSED' ? (
                        <button
                          onClick={() => handleHijackTakeover(activeConversation.id)}
                          className="px-3.5 py-1.5 border-2 rounded-xl text-[10px] font-black uppercase text-accent hover:bg-accent/5 transition cursor-pointer flex items-center gap-1"
                          style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>AI Takeover Hijack</span>
                        </button>
                      ) : (
                        <span className="px-3.5 py-1.5 bg-neutral-950 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider">
                          ✓ Handled by Advisor
                        </span>
                      )}
                    </div>

                    {/* Messages scrolling list */}
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto text-xs font-medium">
                      {activeConversation.messages.map((m) => (
                        <div key={m.id} className={`flex ${m.role === 'USER' ? 'justify-start' : 'justify-end'} animate-fade-in`}>
                          <div 
                            className={`p-3 rounded-2xl max-w-[80%] leading-relaxed shadow-sm ${m.role === 'USER' ? 'rounded-bl-none' : m.role === 'AGENT' ? 'rounded-br-none text-white' : 'rounded-br-none'}`} 
                            style={
                              m.role === 'USER' 
                                ? { backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderLeft: '3px solid var(--color-border)' } 
                                : m.role === 'AGENT' 
                                  ? { background: 'var(--accent-gradient)' } 
                                  : { backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderRight: `4px solid var(--color-accent)` }
                            }
                          >
                            {m.role === 'AGENT' && (
                              <span className="block text-[8px] uppercase font-bold text-stone-200 font-mono mb-1">Human Recruiter response</span>
                            )}
                            {m.role === 'ASSISTANT' && (
                              <span className="block text-[8px] uppercase font-bold text-accent font-serif mb-1" style={{ color: 'var(--color-accent)' }}>RAG Bot Reply</span>
                            )}

                            <p>{m.content}</p>

                            {m.role === 'ASSISTANT' && m.confidence && (
                              <div className="mt-1.5 pt-1.5 border-t flex items-center justify-between text-[9px] font-mono" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                                <span>Similarity confidence: {m.confidence}%</span>
                                <span className="underline truncate max-w-[124px]">Source: {m.citationSource || 'Catalog'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quick Canned replies snippets selector */}
                    <div className="px-4 py-2 border-t shrink-0 text-[10px] flex gap-2 items-center overflow-x-auto select-none" style={{ borderTopColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
                      <span className="font-extrabold text-neutral-400 uppercase shrink-0">Canned:</span>
                      <button 
                        onClick={() => setAgentReplyText("Absolutely! We provide split payment installment schedules for domestic & foreign admissions.")}
                        className="px-2.5 py-1 border rounded-md transition cursor-pointer shrink-0 text-[10px] font-bold"
                        style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                      >
                        Installments Plan
                      </button>
                      <button 
                        onClick={() => setAgentReplyText("Great news — you qualify for our 45% Merit Excellence Scholarship based on your GPA averages!")}
                        className="px-2.5 py-1 border rounded-md transition cursor-pointer shrink-0 text-[10px] font-bold"
                        style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                      >
                        Merit 45% Waiver
                      </button>
                      <button 
                        onClick={() => setAgentReplyText("I have verified your calendar booking in our advisor slots. Expect an orientation video link shortly.")}
                        className="px-2.5 py-1 border rounded-md transition cursor-pointer shrink-0 text-[10px] font-bold"
                        style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                      >
                        Confirm Appointment
                      </button>
                    </div>

                    {/* Agent Direct reply typing panel */}
                    <form onSubmit={handleSendAgentReply} className="p-3.5 border-t shrink-0 flex gap-2" style={{ borderTopColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
                      <input
                        type="text"
                        value={agentReplyText}
                        onChange={(e) => setAgentReplyText(e.target.value)}
                        placeholder="Hijack this conversation, reply as adviser..."
                        className="flex-1 border rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[var(--color-accent)] font-semibold"
                        style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                      />
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl text-white font-bold transition shadow cursor-pointer text-xs"
                        style={{ background: 'var(--accent-gradient)' }}
                      >
                        Send Over
                      </button>
                    </form>

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-neutral-400 italic">
                    Select ongoing student orientation loop to audit chatbot criteria.
                  </div>
                )}
              </div>

            </div>

          </motion.div>
        )}

        {/* TAB 4: Knowledge Base RAG editor - Routed cleanly back to subcomp */}
        {activeTab === 'kb' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <KnowledgeBasePage />
          </motion.div>
        )}

        {/* TAB 5: Course Programs Manager */}
        {activeTab === 'programs' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Academic Programs Catalog</h1>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Add course directories, configure tuition structures, and publish active rosters.</p>
              </div>

              <button
                onClick={() => setShowAddProgModal(true)}
                className="px-4 py-2.5 rounded-xl text-white text-xs font-bold transition shadow cursor-pointer shadow-accent"
                style={{ background: 'var(--accent-gradient)' }}
              >
                + Add New Program
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch pt-2">
              {programs.map((p) => (
                <div key={p.id} className="border rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm relative group overflow-hidden hover:shadow-md transition" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                  <span className="absolute top-0 right-0 p-1.5 text-[8px] font-bold uppercase rounded-bl-lg font-mono" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}>
                    {p.duration}
                  </span>
                  
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider block" style={{ color: 'var(--color-text-secondary)' }}>{p.department}</span>
                    <h4 className="text-sm font-extrabold tracking-tight block leading-snug" style={{ color: 'var(--color-text-primary)' }}>{p.name}</h4>
                    <p className="text-[11px] leading-normal line-clamp-3" style={{ color: 'var(--color-text-secondary)' }}>{p.description}</p>
                  </div>

                  <div className="space-y-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex justify-between items-baseline text-xs font-mono">
                      <span style={{ color: 'var(--color-text-secondary)' }}>Yearly Tuition:</span>
                      <span className="font-extrabold" style={{ color: 'var(--color-text-primary)' }}>{p.fees}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-205 font-mono">
                        {p.capacityBadge}
                      </span>

                      <button
                        onClick={() => handleDeleteProgram(p.id)}
                        className="text-[10px] text-red-500 hover:underline font-bold transition flex items-center gap-0.5 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* NEW PROGRAM MODEL */}
            {showAddProgModal && (
              <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-fade-in text-xs">
                <div className="border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black uppercase" style={{ color: 'var(--color-text-primary)' }}>Add New Syllabus Program</h3>
                    <button onClick={() => setShowAddProgModal(false)} className="transition cursor-pointer" style={{ color: 'var(--color-text-secondary)' }}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateProgram} className="space-y-3 pt-2 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide animate-none" style={{ color: 'var(--color-text-secondary)' }}>Program Name</label>
                      <input
                        type="text"
                        required
                        value={newProgName}
                        onChange={(e) => setNewProgName(e.target.value)}
                        placeholder="e.g. M.Sc. Data Science and Finance"
                        className="w-full border rounded-xl px-3 py-2 outline-none font-semibold"
                        style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Faculty Dept</label>
                        <input
                          type="text"
                          required
                          value={newProgDept}
                          onChange={(e) => setNewProgDept(e.target.value)}
                          className="w-full border rounded-xl px-3 py-2 outline-none font-semibold"
                          style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Duration</label>
                        <input
                          type="text"
                          required
                          value={newProgDuration}
                          onChange={(e) => setNewProgDuration(e.target.value)}
                          className="w-full border rounded-xl px-3 py-2 outline-none font-semibold"
                          style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Yearly Tuition</label>
                        <input
                          type="text"
                          required
                          value={newProgFees}
                          onChange={(e) => setNewProgFees(e.target.value)}
                          className="w-full border rounded-xl px-3 py-2 outline-none font-semibold"
                          style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Cap Status Badge</label>
                        <input
                          type="text"
                          value={newProgBadge}
                          onChange={(e) => setNewProgBadge(e.target.value)}
                          className="w-full border rounded-xl px-3 py-2 outline-none font-semibold"
                          style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Syllabus Overview Description</label>
                      <textarea
                        rows={3}
                        required
                        value={newProgDesc}
                        onChange={(e) => setNewProgDesc(e.target.value)}
                        placeholder="Overview objectives program highlights..."
                        className="w-full border rounded-xl px-3 py-2 outline-none resize-none animate-none font-semibold leading-relaxed"
                        style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                      ></textarea>
                    </div>

                    <div className="flex gap-2 justify-end pt-4 font-bold text-xs">
                      <button
                        type="button"
                        onClick={() => setShowAddProgModal(false)}
                        className="px-4 py-2 border rounded-xl cursor-pointer"
                        style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-xl text-white transition shadow cursor-pointer"
                        style={{ background: 'var(--accent-gradient)' }}
                      >
                        Save Catalog Program
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </motion.div>
        )}

        {/* TAB 6: Calendar Appointments ledger */}
        {activeTab === 'appointments' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
            <div>
              <h1 className="text-xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>ORIENTATION INTERVIEWS CALENDAR</h1>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Track and confirm incoming video admissions or phone slots with international prospective students.</p>
            </div>

            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 font-bold border-b text-neutral-500" style={{ borderBottomColor: 'var(--color-border)' }}>
                    <th className="px-4 py-3">Applicant Candidate</th>
                    <th className="px-4 py-3">Counseling Program</th>
                    <th className="px-4 py-3">Time Constraints</th>
                    <th className="px-4 py-3">Format Type</th>
                    <th className="px-4 py-3 text-right">Activity Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ divideColor: 'var(--color-border)' }}>
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-neutral-400 italic">No appointments registered.</td>
                    </tr>
                  ) : (
                    appointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-zinc-50 transition">
                        <td className="px-4 py-4.5 font-bold text-neutral-950">{appt.leadName}</td>
                        <td className="px-4 py-4.5 text-neutral-600 font-bold max-w-[150px] truncate" title={appt.program}>{appt.program}</td>
                        <td className="px-4 py-4.5 text-neutral-500 font-mono text-[10px]">
                          <strong>{appt.date}</strong> at <strong>{appt.time}</strong> ({appt.timezone || 'Yaoundé'})
                        </td>
                        <td className="px-4 py-4.5 font-bold">
                          <span className={`text-[9px] font-mono font-bold border px-2.5 py-0.5 rounded-full ${appt.type === 'VIDEO' ? 'bg-indigo-50 text-indigo-750 border-indigo-200' : 'bg-amber-50 text-amber-800 border-amber-250'}`}>
                            {appt.type} CALL
                          </span>
                        </td>
                        <td className="px-4 py-4.5 text-right font-black">
                          <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-full px-3 py-1 font-mono uppercase">
                            ● CONFIRMED
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB 7: Visual reports map charts - Routed cleanly to reports subcomp */}
        {activeTab === 'reports' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <ReportsPage leads={leads} conversations={conversations} appointments={appointments} />
          </motion.div>
        )}

        {/* TAB 8: Widget configuration page */}
        {activeTab === 'widget_config' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <form onSubmit={handleSaveConfig} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>{translate('widgetConfig')}</h1>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Configure branding parameters, welcome triggers, and client interactive scripts.</p>
              </div>

              <div className="flex gap-2">
                {saveStatus === 'saved' && (
                  <span className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold font-mono inline-block animate-bounce">
                    ✓ Sync Successful!
                  </span>
                )}
                <button
                  type="submit"
                  disabled={saveStatus === 'saving'}
                  className="px-6 py-2.5 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer shadow-accent"
                  style={{ background: 'var(--accent-gradient)' }}
                >
                  {saveStatus === 'saving' ? 'Syncing...' : translate('save')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-xs">
              {/* Branding and configuration properties columns */}
              <div className="lg:col-span-7 space-y-6">
                <div className="border rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Interface Parameters</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold block uppercase tracking-wide text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Assistant Bot Name</label>
                      <input
                        type="text"
                        value={cfgBotName}
                        onChange={(e) => setCfgBotName(e.target.value)}
                        className="w-full border rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[var(--color-accent)] font-semibold"
                        style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' , borderColor: 'var(--color-border)' }}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold block uppercase tracking-wide text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>WhatsApp Redirect Channel</label>
                      <input
                        type="text"
                        value={cfgWhatsAppNumber}
                        onChange={(e) => setCfgWhatsAppNumber(e.target.value)}
                        className="w-full border rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[var(--color-accent)] font-semibold"
                        style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' , borderColor: 'var(--color-border)' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold block uppercase tracking-wide text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Initial Greeting Overrides</label>
                    <textarea
                      rows={3}
                      value={cfgWelcomeMessage}
                      onChange={(e) => setCfgWelcomeMessage(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 text-xs outline-none resize-none animate-none font-semibold leading-relaxed"
                      style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' , borderColor: 'var(--color-border)' }}
                    ></textarea>
                  </div>
                </div>

                {/* Brand Options Button & Customized UI Box */}
                <div className="border rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                  <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--color-border)' }}>
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-accent)' }}></span>
                        <span>Interactive Brand Customizer</span>
                      </h3>
                      <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Configure positioning, color themes, launcher style and live previews.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBrandCustomize(!showBrandCustomize)}
                      className="px-3 py-1.5 border rounded-lg transition cursor-pointer text-[10px] font-bold flex items-center gap-1 hover:opacity-90"
                      style={{ color: 'var(--color-text-primary)', borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}
                    >
                      <span>{showBrandCustomize ? 'Hide Config' : 'Configure Brand'}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showBrandCustomize ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {showBrandCustomize && (
                    <div className="space-y-4 pt-2 animate-fade-in">
                      {/* Color Palette customization options */}
                      <div className="space-y-2">
                        <label className="font-bold block uppercase tracking-wide text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Select Color Palette Theme ({activeTheme.label})</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                          {Object.entries(THEMES).map(([id, t]) => {
                            const isSelected = activeTheme.id === id;
                            return (
                              <div
                                key={id}
                                className={`border rounded-xl p-3 text-center transition-all flex flex-col justify-between items-center gap-2.5 relative cursor-pointer select-none group ${
                                  isSelected 
                                    ? 'ring-2 ring-[var(--color-accent)] ring-offset-2 shadow-md' 
                                    : 'hover:border-[var(--color-accent)] shadow-xs hover:scale-[1.02]'
                                }`}
                                style={{
                                  borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-border)',
                                  backgroundColor: 'var(--color-bg-secondary)',
                                  color: 'var(--color-text-primary)',
                                }}
                                onClick={() => {
                                  setThemeById(id as any);
                                  setCfgCustomAccent(''); // Reset individual override on theme switch
                                }}
                              >
                                {isSelected && (
                                  <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] text-white font-extrabold shadow" style={{ background: 'var(--color-accent)' }}>
                                    ✓
                                  </span>
                                )}
                                <span
                                  className="font-extrabold text-[10px] leading-tight block truncate tracking-tight group-hover:text-[var(--color-accent)] transition-colors"
                                >
                                  {t.label}
                                </span>

                                <div className="flex gap-1.5 justify-center mt-1">
                                  {[
                                    { key: 'accent', value: t.tokens.accent, label: 'Accent' },
                                    { key: 'bg_primary', value: t.tokens.bg_primary, label: 'Primary bg' },
                                    { key: 'bg_card', value: t.tokens.bg_card, label: 'Card bg' }
                                  ].map((item) => {
                                    const isColorActive = isSelected && (cfgCustomAccent === item.value || (cfgCustomAccent === "" && item.key === 'accent'));
                                    return (
                                      <button
                                        type="button"
                                        key={item.key}
                                        title={`Use ${item.label} (${item.value})`}
                                        onClick={(e) => {
                                          e.stopPropagation(); // prevent container click from resetting custom accent
                                          if (!isSelected) {
                                            setThemeById(id as any);
                                          }
                                          setCfgCustomAccent(item.value);
                                        }}
                                        className="w-5 h-5 rounded-full border transition cursor-pointer relative shadow-inner hover:scale-115 flex items-center justify-center"
                                        style={{
                                          backgroundColor: item.value,
                                          borderColor: isColorActive ? 'var(--color-text-primary)' : 'rgba(0,0,0,0.15)',
                                          borderWidth: isColorActive ? '2px' : '1px'
                                        }}
                                      >
                                        {isColorActive && (
                                          <span className="w-1.5 h-1.5 rounded-full bg-white mix-blend-difference" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Positioning and Launcher bubble customization details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* POSITION */}
                        <div className="space-y-1.5">
                          <label className="font-bold block uppercase tracking-wide text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Widget Position on Screen</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setCfgPosition('right_bottom')}
                              className={`py-2 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${cfgPosition === 'right_bottom' ? 'text-white border-transparent' : ''}`}
                              style={cfgPosition === 'right_bottom' 
                                ? { background: 'var(--accent-gradient)' } 
                                : { backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }
                              }
                            >
                              ↘ Right Bottom
                            </button>
                            <button
                              type="button"
                              onClick={() => setCfgPosition('left_bottom')}
                              className={`py-2 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${cfgPosition === 'left_bottom' ? 'text-white border-transparent' : ''}`}
                              style={cfgPosition === 'left_bottom' 
                                ? { background: 'var(--accent-gradient)' } 
                                : { backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }
                              }
                            >
                              ↙ Left Bottom
                            </button>
                          </div>
                        </div>

                        {/* HELPER LAUNCHER EMOJI */}
                        <div className="space-y-1.5">
                          <label className="font-bold block uppercase tracking-wide text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Launcher Bubble Icon Preset</label>
                          <div className="flex gap-1.5 overflow-x-auto pb-1">
                            {['🎓', '🤖', '💬', '👩', '✨', '🏫'].map((emoji) => {
                              const isSelected = cfgLauncherEmoji === emoji;
                              return (
                                <button
                                  type="button"
                                  key={emoji}
                                  onClick={() => setCfgLauncherEmoji(emoji)}
                                  className={`w-8 h-8 rounded-xl border flex items-center justify-center text-sm transition cursor-pointer shrink-0`}
                                  style={isSelected 
                                    ? { borderColor: 'var(--color-accent)', backgroundColor: 'var(--color-bg-secondary)', outline: '1px solid var(--color-accent)' }
                                    : { borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }
                                  }
                                >
                                  {emoji}
                                </button>
                              );
                            })}
                            <input
                              type="text"
                              maxLength={3}
                              value={cfgLauncherEmoji}
                              onChange={(e) => setCfgLauncherEmoji(e.target.value)}
                              placeholder="..."
                              className="w-10 h-8 text-center border rounded-xl text-xs outline-none uppercase shrink-0 font-bold"
                              style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                              title="Custom character symbol"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Animation pulse option */}
                      <label 
                        className="flex items-center justify-between border rounded-xl p-3 transition cursor-pointer font-bold"
                        style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
                      >
                        <div>
                          <span style={{ color: 'var(--color-text-primary)' }}>Interactive Pulse Notification Ring</span>
                          <span className="text-[9px] font-normal block mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Bonus launcher glow animation triggers when student is idle</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={cfgPulseEnabled}
                          onChange={() => setCfgPulseEnabled(!cfgPulseEnabled)}
                          className="w-4 h-4 rounded text-accent"
                          style={{ accentColor: 'var(--color-accent)' }}
                        />
                      </label>
                    </div>
                  )}
                </div>

                <div className="border rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent" style={{ color: 'var(--color-accent)' }}>Features Toggles</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
                    <label 
                      className="flex items-center justify-between border rounded-xl p-3 transition cursor-pointer"
                      style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    >
                      <div>
                        <span>Require Conversational Lead form</span>
                        <span className="text-[9px] font-normal block mt-0.5 animate-none" style={{ color: 'var(--color-text-secondary)' }}>Prompt student statistics capture first</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={cfgLeadCapture}
                        onChange={() => setCfgLeadCapture(!cfgLeadCapture)}
                        className="w-4 h-4 rounded text-accent"
                        style={{ accentColor: 'var(--color-accent)' }}
                      />
                    </label>

                    <label 
                      className="flex items-center justify-between border rounded-xl p-3 transition cursor-pointer"
                      style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    >
                      <div>
                        <span>Active Video Slot Schedulers</span>
                        <span className="text-[9px] font-normal block mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Let captured applicants book a demo</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={cfgBooking}
                        onChange={() => setCfgBooking(!cfgBooking)}
                        className="w-4 h-4 rounded text-accent"
                        style={{ accentColor: 'var(--color-accent)' }}
                      />
                    </label>

                    <label 
                      className="flex items-center justify-between border rounded-xl p-3 transition cursor-pointer"
                      style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    >
                      <div>
                        <span>Allow Advisor takeover cues</span>
                        <span className="text-[9px] font-normal block mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Show "Ask Recruiter Help" buttons</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={cfgHandoff}
                        onChange={() => setCfgHandoff(!cfgHandoff)}
                        className="w-4 h-4 rounded text-accent"
                        style={{ accentColor: 'var(--color-accent)' }}
                      />
                    </label>

                    <label 
                      className="flex items-center justify-between border rounded-xl p-3 transition cursor-pointer"
                      style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    >
                      <div>
                        <span>Confidence display stats</span>
                        <span className="text-[9px] font-normal block mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Below each RAG reply, show similarity scores</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={cfgConfidence}
                        onChange={() => setCfgConfidence(!cfgConfidence)}
                        className="w-4 h-4 rounded text-accent"
                        style={{ accentColor: 'var(--color-accent)' }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Javascript embed instructions and trigger options column */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Embed code snippet */}
                <div className="bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent" style={{ color: 'var(--color-accent)' }}>WordPress / Webflow Embed script</h3>
                  <p className="text-[10px] text-zinc-400 leading-normal">Insert this single code snippet inside your global website header or footer layout template:</p>
                  
                  <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg font-mono text-[10px] break-all leading-normal select-all">
                    {`<script src="https://cdn.enrollai.com/widget.js" data-key="ea_live_67a0dbf09ca889ff212" defer></script>`}
                  </div>
                </div>

                {/* Behavioral trigger speeds parameters options */}
                <div className="border rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-accent" style={{ color: 'var(--color-accent)' }}>Behavioral Triggers</h3>

                  <div className="space-y-3 text-xs font-bold">
                    <label 
                      className="flex items-center justify-between border rounded-xl p-3 transition cursor-pointer"
                      style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    >
                      <div>
                        <span>Time Delayed Popup</span>
                        <span className="text-[9px] font-normal block mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Autoshow teaser speech bubbles</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={cfgTimeTrigger}
                        onChange={() => setCfgTimeTrigger(!cfgTimeTrigger)}
                        className="w-4 h-4"
                        style={{ accentColor: 'var(--color-accent)' }}
                      />
                    </label>

                    {cfgTimeTrigger && (
                      <div className="px-3 py-2 border rounded-xl space-y-1.5 animate-fade-in" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                        <div className="flex justify-between items-baseline text-[10px] font-mono font-bold" style={{ color: 'var(--color-text-secondary)' }}>
                           <span>Delay threshold timer:</span>
                           <span style={{ color: 'var(--color-text-primary)' }}>{cfgTimeDelay} seconds</span>
                        </div>
                        <input
                          type="range"
                          min={2}
                          max={30}
                          value={cfgTimeDelay}
                          onChange={(e) => setCfgTimeDelay(Number(e.target.value))}
                          className="w-full accent-accent"
                          style={{ accentColor: 'var(--color-accent)' }}
                        />
                      </div>
                    )}

                    <label 
                      className="flex items-center justify-between border rounded-xl p-3 transition cursor-pointer"
                      style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    >
                      <div>
                        <span>Exit Intent Recovery overlay</span>
                        <span className="text-[9px] font-normal block mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Lock-in waivers when user leaves tab bounds</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={cfgExitIntent}
                        onChange={() => setCfgExitIntent(!cfgExitIntent)}
                        className="w-4 h-4"
                        style={{ accentColor: 'var(--color-accent)' }}
                      />
                    </label>

                    <label 
                      className="flex items-center justify-between border rounded-xl p-3 transition cursor-pointer"
                      style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    >
                      <div>
                        <span>Idle pulsation launcher aura</span>
                        <span className="text-[9px] font-normal block mt-0.5 font-sans" style={{ color: 'var(--color-text-secondary)' }}>Glow launcher if active user remains inactive</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={cfgIdleTrigger}
                        onChange={() => setCfgIdleTrigger(!cfgIdleTrigger)}
                        className="w-4 h-4"
                        style={{ accentColor: 'var(--color-accent)' }}
                      />
                    </label>
                  </div>
                </div>

              </div>
            </div>

          </form>
          </motion.div>
        )}

        {/* TAB 9: Billing Ledger settings Routed cleanly back to subcomp */}
        {activeTab === 'billing' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <BillingPage leadsCount={leads.length} convsCount={conversations.length} />
          </motion.div>
        )}

        {/* TAB 10: Team Members administration dashboard */}
        {activeTab === 'team' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <TeamMembers />
          </motion.div>
        )}

        {/* TAB 11: User Profile Settings dashboard */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <UserProfile onProfileUpdated={loadData} />
          </motion.div>
        )}

        {/* TAB 12: Embedded Setup Wizard panel */}
        {activeTab === 'setup_wizard' && (
          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3 }}
            className="space-y-6"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-black">Assistant Setup Wizard</h2>
              </div>
              <p className="text-xs max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
                Configure client-facing theme color parameters, choose active institutional specialisation verticals, set greeting rules, and seed basic knowledge catalogs directly using the smart onboarding guide.
              </p>
            </div>

            {/* If they are already onboarded, let them know they can re-run it anytime! */}
            {tenantProfile?.onboarded === 1 && (
              <div 
                className="p-4 rounded-xl border flex items-start gap-3 bg-emerald-500/5" 
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500 text-white shrink-0 shadow-xs">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400">Setup Already Completed!</h4>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                    Your primary assistant profile, chatbot welcome guidelines, and default templates are currently active. If you wish to redesign your system with a different style or school vertical, feel free to run the wizard below again.
                  </p>
                </div>
              </div>
            )}

            <div 
              className="rounded-2xl border p-4 sm:p-6 min-h-[450px] flex items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
            >
              <div className="w-full max-w-3xl">
                <OnboardingWizard 
                  onSkip={() => {
                    setActiveTab('dashboard');
                  }}
                  onComplete={async (themeId, wizardBotName, vertical, scraped) => {
                    const token = localStorage.getItem('enrollai_session_token');
                    try {
                      await fetch('/api/tenant/onboard', {
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': token ? `Bearer ${token}` : ''
                        },
                        body: JSON.stringify({
                          botName: wizardBotName,
                          primaryColor: '#6366F1',
                          welcomeMessage: cfgWelcomeMessage || 'Hello! Choose an option or query our interactive assistant.',
                          plan: 'Starter',
                          theme: themeId,
                          vertical: vertical,
                          scraped: scraped
                        })
                      });
                    } catch (err) {
                      console.error('Onboarding submission failed:', err);
                    }
                    localStorage.removeItem('enrollai_skipped_wizard');
                    setSkippedWizard(false);
                    loadData();
                    setActiveTab('dashboard');
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}

      </main>

      {/* Persistent floating launcher sandbox widget synced dynamically with form configs */}
      <FloatingWidget />

      {/* Configuration reminder banner for uncompleted setups */}
      <ConfigurationReminderWidget
        onboarded={tenantProfile?.onboarded === 1}
        tenantProfile={tenantProfile}
        onResumeWizard={() => {
          localStorage.removeItem('enrollai_skipped_wizard');
          setSkippedWizard(false);
          setShowWizard(true);
        }}
      />

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </LanguageProvider>
  );
}
