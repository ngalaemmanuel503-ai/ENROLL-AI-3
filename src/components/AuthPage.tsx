import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { supabase, isSupabaseConfigured, signMockToken } from '../lib/supabase';
import { Sparkles, ArrowRight, ShieldCheck, Mail, Lock, Building, User, X, Globe } from 'lucide-react';

interface AuthPageProps {
  onSuccess: (token: string, email: string) => void;
  onCancel: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthPage({ onSuccess, onCancel, initialMode = 'signup' }: AuthPageProps) {
  const { activeLanguage, translate } = useLanguage();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Google Account Selector Simulation State for non-Supabase environments
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleStep, setGoogleStep] = useState<1 | 2 | 3>(1); // 1 = select preconfigured accounts, 2 = custom account flow, 3 = progress loop
  const [googleModalLoading, setGoogleModalLoading] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');
  const [googleCustomName, setGoogleCustomName] = useState('');
  const [googleCustomCompany, setGoogleCustomCompany] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg(activeLanguage === 'fr' ? 'Email et mot de passe requis' : 'Email and password are required');
      return;
    }
    if (!isLogin && (!fullName || !companyName)) {
      setErrorMsg(activeLanguage === 'fr' ? 'Nom complet et entreprise requis' : 'Full name and company name are required');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSupabaseConfigured && supabase) {
        // Active Supabase Auth Flow
        if (isLogin) {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          if (data.session) {
            const sToken = data.session.access_token;
            const res = await fetch('/api/auth/sync', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sToken}`
              },
              body: JSON.stringify({ email })
            });
            if (res.ok) {
              setSuccessMsg(activeLanguage === 'fr' ? 'Connexion réussie !' : 'Login successful!');
              setTimeout(() => {
                onSuccess(sToken, email);
              }, 1000);
            } else {
              const body = await res.json().catch(() => ({}));
              throw new Error(body.message || 'Server tenant sync failed');
            }
          }
        } else {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { fullName, companyName }
            }
          });
          if (error) throw error;
          
          // Register user locally
          const mockJwt = signMockToken(email);
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, fullName, companyName })
          });

          if (res.ok) {
            setSuccessMsg(activeLanguage === 'fr' ? 'Inscription réussie ! Un email de confirmation a été envoyé par Supabase.' : 'Registration successful! A confirmation email has been dispatched by Supabase.');
            setTimeout(() => {
              onSuccess(mockJwt, email);
            }, 1500);
          } else {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.message || 'Local registration setup failed');
          }
        }
      } else {
        // Fallback Mock Auth Flow for live previews
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const payload = isLogin 
          ? { email, password }
          : { email, password, fullName, companyName };

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok && data.token) {
          setSuccessMsg(isLogin 
            ? (activeLanguage === 'fr' ? 'Connexion réussie ! (Mode démo)' : 'Successful login! (Preview mode)')
            : (activeLanguage === 'fr' ? 'Inscription réussie ! (Mode démo)' : 'Registration successful! (Preview mode)')
          );
          setTimeout(() => {
            onSuccess(data.token, email);
          }, 1200);
        } else {
          throw new Error(data.message || (activeLanguage === 'fr' ? 'Identifiants invalides ou échec de la synchronisation' : 'Invalid credentials or synchronisation failure'));
        }
      }
    } catch (err: any) {
      console.error('Authentication Error:', err);
      setErrorMsg(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const executeMockGoogleSignIn = async (selectedEmail: string, selectedName: string, selectedCompany: string) => {
    setGoogleModalLoading(true);
    setGoogleStep(3); // transition to loader step
    
    try {
      const mockJwt = signMockToken(selectedEmail);

      // Register / sync locally on SQLite DB
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: selectedEmail, 
          password: 'google-oauth-mock-secret', 
          fullName: selectedName, 
          companyName: selectedCompany
        })
      });

      if (res.ok) {
        setTimeout(() => {
          setGoogleModalLoading(false);
          setShowGoogleModal(false);
          setSuccessMsg(
            activeLanguage === 'fr' 
              ? 'Authentification Google réussie ! (Mode démo)' 
              : 'Google Authenticated successfully! (Preview Mode)'
          );
          setTimeout(() => {
            onSuccess(mockJwt, selectedEmail);
          }, 1000);
        }, 1500);
      } else {
        // If already registered, log in
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: selectedEmail, password: 'google-oauth-mock-secret' })
        });
        const loginData = await loginRes.json().catch(() => ({}));
        
        setTimeout(() => {
          setGoogleModalLoading(false);
          setShowGoogleModal(false);
          if (loginRes.ok && loginData.token) {
            setSuccessMsg(
              activeLanguage === 'fr' 
                ? 'Connexion Google réussie ! (Mode démo)' 
                : 'Google sign-in successful! (Preview Mode)'
            );
            setTimeout(() => {
              onSuccess(loginData.token, selectedEmail);
            }, 1000);
          } else {
            setErrorMsg(activeLanguage === 'fr' ? 'La connexion Google a échoué.' : 'Google authentication routing failed.');
          }
        }, 1500);
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setGoogleModalLoading(false);
      setShowGoogleModal(false);
      setErrorMsg(err.message || 'An unexpected Google OAuth error occurred.');
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSupabaseConfigured && supabase) {
        setLoading(true);
        // Active Supabase Auth Flow with Google OAuth
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) throw error;
      } else {
        // Show Google Account selector instead of instantly auto-approving
        setGoogleStep(1);
        setGoogleCustomEmail('');
        setGoogleCustomName('');
        setGoogleCustomCompany('');
        setShowGoogleModal(true);
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setErrorMsg(err.message || 'An unexpected Google OAuth error occurred.');
      setLoading(false);
    }
  };

  const userRolePrefix = (name: string) => {
    if (!name) return 'google-user';
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  };

  return (
    <div 
      className="min-h-[85vh] w-full flex items-center justify-center p-4 sm:p-6 md:p-8" 
      id="auth_view_container"
    >
      <div 
        className="w-full max-w-md border rounded-3xl shadow-2xl overflow-hidden self-center transition-all duration-300 transform grow"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)'
        }}
      >
        {/* Banner header badge */}
        <div 
          className="p-6 sm:p-8 relative border-b"
          style={{ 
            backgroundColor: 'var(--color-bg-secondary)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div 
            className="absolute top-4 right-4 text-[10px] font-mono tracking-widest uppercase py-0.5 px-2.5 rounded-full flex items-center gap-1 font-black"
            style={{
              backgroundColor: 'var(--badge-bg)',
              color: 'var(--badge-text)'
            }}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Tunnel</span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🎓</span>
            <span 
              className="font-mono text-xs font-black tracking-widest uppercase"
              style={{ color: 'var(--color-accent)' }}
            >
              EnrollAI SaaS Hub
            </span>
          </div>
          
          <h2 className="text-lg sm:text-xl font-black tracking-tight mt-1">
            {isLogin 
              ? (activeLanguage === 'fr' ? 'Connexion Conseiller' : 'Admissions Portal Login') 
              : (activeLanguage === 'fr' ? 'Création de Compte SaaS' : 'Partner Registration')
            }
          </h2>
          <p 
            className="text-xs mt-1 leading-normal"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {isLogin 
              ? (activeLanguage === 'fr' ? 'Accédez à vos tableaux de bord RAG conversationnels' : 'Access your unified B2B enrollment chatboards')
              : (activeLanguage === 'fr' ? 'Créez votre espace sécurisé pour commencer l\'onboarding' : 'Configure your workspace and begin advisor onboarding')
            }
          </p>
        </div>

        {/* Tab Selection */}
        <div 
          className="grid grid-cols-2 border-b text-xs font-bold font-mono"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <button
            type="button"
            onClick={() => { setIsLogin(true); setErrorMsg(''); }}
            className="py-3.5 text-center cursor-pointer transition-all"
            style={{ 
              backgroundColor: isLogin ? 'var(--color-bg-secondary)' : 'transparent',
              color: isLogin ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              borderBottom: isLogin ? '2px solid var(--color-accent)' : 'none',
              borderRight: '1px solid var(--color-border)'
            }}
          >
            {activeLanguage === 'fr' ? 'SE CONNECTER' : 'SIGN IN'}
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setErrorMsg(''); }}
            className="py-3.5 text-center cursor-pointer transition-all"
            style={{ 
              backgroundColor: !isLogin ? 'var(--color-bg-secondary)' : 'transparent',
              color: !isLogin ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              borderBottom: !isLogin ? '2px solid var(--color-accent)' : 'none'
            }}
          >
            {activeLanguage === 'fr' ? 'S\'INSCRIRE' : 'CREATE ACCOUNT'}
          </button>
        </div>

        <form onSubmit={handleAuth} className="p-6 sm:p-8 space-y-4">
          
          {/* Notifications area */}
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 text-xs font-medium">
              ⚠️ {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 rounded-xl p-3 text-xs font-bold leading-normal">
              ✅ {successMsg}
            </div>
          )}

          {/* Social Google Auto Signup & Signin connector */}
          <div className="space-y-3 pb-2">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full text-xs font-bold px-5 py-3 rounded-xl border transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.68 14.93 1 12 1 7.35 1 3.39 3.65 1.44 7.5L5.1 10.3c.92-2.76 3.51-4.7 6.9-4.7z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.68 2.85c2.14-1.98 3.75-4.89 3.75-8.58z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.1 13.7c-.24-.7-.38-1.46-.38-2.2c0-.74.14-1.5.38-2.2L1.44 6.5C.52 8.15 0 10.01 0 12c0 1.99.52 3.85 1.44 5.5l3.66-2.8z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.08 7.96-2.91l-3.68-2.85c-1.1.74-2.5 1.18-4.28 1.18-3.39 0-5.98-1.94-6.9-4.7L1.44 16.5C3.39 20.35 7.35 23 12 23z"
                />
              </svg>
              <span>
                {isLogin 
                  ? (activeLanguage === 'fr' ? 'Se connecter avec Google' : 'Sign in with Google') 
                  : (activeLanguage === 'fr' ? 'S\'enregistrer avec Google' : 'Sign up with Google')
                }
              </span>
            </button>

            <div className="flex items-center gap-2 py-1">
              <div className="h-[1px] flex-1" style={{ backgroundColor: 'var(--color-border)' }}></div>
              <span className="text-[9px] font-mono tracking-widest uppercase font-bold" style={{ color: 'var(--color-text-secondary)' }}>
                {activeLanguage === 'fr' ? 'OU PAR COURIEL' : 'OR WITH EMAIL'}
              </span>
              <div className="h-[1px] flex-1" style={{ backgroundColor: 'var(--color-border)' }}></div>
            </div>
          </div>

          {/* Setup Inputs */}
          {!isLogin && (
            <>
              <div className="space-y-1">
                <label 
                  className="text-[10px] font-bold uppercase tracking-wider block"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {activeLanguage === 'fr' ? 'Nom complet' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3" style={{ color: 'var(--color-text-secondary)' }} />
                  <input
                    type="text"
                    required
                    placeholder={activeLanguage === 'fr' ? 'ex. Jean Emmanuel' : 'e.g. Jason Emmanuel'}
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full text-xs border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-offset-0 focus:border-transparent transition-all"
                    style={{ 
                      backgroundColor: 'var(--color-bg-secondary)', 
                      borderColor: 'var(--color-border)', 
                      color: 'var(--color-text-primary)'
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label 
                  className="text-[10px] font-bold uppercase tracking-wider block"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {activeLanguage === 'fr' ? 'Nom de l\'entreprise / École' : 'Company or School Name'}
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3.5 top-3" style={{ color: 'var(--color-text-secondary)' }} />
                  <input
                    type="text"
                    required
                    placeholder={activeLanguage === 'fr' ? 'ex. Horizon University' : 'e.g. Horizon Academy'}
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full text-xs border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-offset-0 focus:border-transparent transition-all"
                    style={{ 
                      backgroundColor: 'var(--color-bg-secondary)', 
                      borderColor: 'var(--color-border)', 
                      color: 'var(--color-text-primary)'
                    }}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label 
              className="text-[10px] font-bold uppercase tracking-wider block"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3" style={{ color: 'var(--color-text-secondary)' }} />
              <input
                type="email"
                required
                placeholder="advisor@enrollai.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full text-xs border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-offset-0 focus:border-transparent transition-all"
                style={{ 
                  backgroundColor: 'var(--color-bg-secondary)', 
                  borderColor: 'var(--color-border)', 
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label 
              className="text-[10px] font-bold uppercase tracking-wider block"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3" style={{ color: 'var(--color-text-secondary)' }} />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full text-xs border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-offset-0 focus:border-transparent transition-all"
                style={{ 
                  backgroundColor: 'var(--color-bg-secondary)', 
                  borderColor: 'var(--color-border)', 
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>
          </div>

          {/* Action CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 text-xs font-bold text-white px-5 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
            style={{ 
              backgroundImage: 'linear-gradient(135deg, var(--color-accent) 0%, #FF8A65 100%)',
              boxShadow: 'var(--accent-shadow)'
            }}
          >
            {loading ? (
              <span>{activeLanguage === 'fr' ? 'Traitement en cours...' : 'Saving Secure Credentials...'}</span>
            ) : (
              <>
                <span>
                  {isLogin 
                    ? (activeLanguage === 'fr' ? "Déverrouiller le Portail" : "Initialize Dashboard Session") 
                    : (activeLanguage === 'fr' ? "Créer mon Espace SaaS" : "Register Workspace & Onboard")
                  }
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          {/* Quick Notice */}
          <div 
            className="text-[10px] text-center flex items-center justify-center gap-1 mt-2.5"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <Sparkles className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
            <span>
              {!isSupabaseConfigured 
                ? (activeLanguage === 'fr' ? "Évaluation sans clé actif" : "Preview evaluation mode (No secrets required)")
                : (activeLanguage === 'fr' ? "Instance Supabase connectée" : "Connected directly to live Supabase DB")
              }
            </span>
          </div>

          <div className="pt-2 text-center border-t mt-4" style={{ borderColor: 'var(--color-border)' }}>
            <button
              type="button"
              onClick={onCancel}
              className="text-[10px] font-mono font-bold hover:opacity-80 underline cursor-pointer"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {activeLanguage === 'fr' ? "← Écran d'accueil" : "← Return to Landing Page"}
            </button>
          </div>
        </form>
      </div>

      {showGoogleModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" id="google_sso_modal">
          <div 
            className="w-full max-w-sm border rounded-2xl p-6 sm:p-8 flex flex-col shadow-2xl relative animate-fade-in"
            style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          >
            {/* Close modal */}
            <button 
              onClick={() => { if (!googleModalLoading) setShowGoogleModal(false); }}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-800/10 dark:hover:bg-white/10 transition cursor-pointer"
              disabled={googleModalLoading}
            >
              <X className="w-4 h-4 text-neutral-400" />
            </button>

            {/* Google Colorful Header Logo */}
            <div className="flex justify-center mb-4">
              <svg className="w-8 h-8 filter drop-shadow-sm" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.68 14.93 1 12 1 7.35 1 3.39 3.65 1.44 7.5L5.1 10.3c.92-2.76 3.51-4.7 6.9-4.7z"/>
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.68 2.85c2.14-1.98 3.75-4.89 3.75-8.58z"/>
                <path fill="#FBBC05" d="M5.1 13.7c-.24-.7-.38-1.46-.38-2.2c0-.74.14-1.5.38-2.2L1.44 6.5C.52 8.15 0 10.01 0 12c0 1.99.52 3.85 1.44 5.5l3.66-2.8z"/>
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.08 7.96-2.91l-3.68-2.85c-1.1.74-2.5 1.18-4.28 1.18-3.39 0-5.98-1.94-6.9-4.7L1.44 16.5C3.39 20.35 7.35 23 12 23z"/>
              </svg>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-sm sm:text-base font-bold font-sans tracking-tight">
                {googleStep === 3 
                  ? (activeLanguage === 'fr' ? 'Connexion en cours...' : 'Connecting Account...')
                  : (activeLanguage === 'fr' ? 'Choisissez un compte' : 'Choose an account')
                }
              </h3>
              <p className="text-[10px] font-mono mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                {googleStep === 3 
                  ? (activeLanguage === 'fr' ? 'Établissement du tunnel SSO sécurisé...' : 'Securing workspace OAuth flow...')
                  : (activeLanguage === 'fr' ? 'pour continuer vers EnrollAI' : 'to continue to EnrollAI SaaS Hub')
                }
              </p>
            </div>

            {/* STEP 1: Account list selector */}
            {googleStep === 1 && (
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                {/* Real personalized partner option */}
                <button
                  type="button"
                  onClick={() => executeMockGoogleSignIn('ngalaemmanuelshey503@gmail.com', 'Ngala Emmanuel Shey', 'Active Workspace')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border text-left hover:scale-[1.01] transition-all duration-200 cursor-pointer"
                  style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    N
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">Ngala Emmanuel Shey</p>
                    <p className="text-[10px] font-mono truncate text-neutral-400">ngalaemmanuelshey503@gmail.com</p>
                  </div>
                  <span className="text-[9px] font-bold uppercase py-0.5 px-2 rounded-full font-mono bg-indigo-500/15 text-indigo-400">Admin</span>
                </button>

                {/* Simulated Admissions Team option */}
                <button
                  type="button"
                  onClick={() => executeMockGoogleSignIn('partner.admissions@enrollai.edu', 'Admissions Board', 'Horizon Admissions')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border text-left hover:scale-[1.01] transition-all duration-200 cursor-pointer"
                  style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
                >
                  <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    A
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">Admissions Board</p>
                    <p className="text-[10px] font-mono truncate text-neutral-400">partner.admissions@enrollai.edu</p>
                  </div>
                  <span className="text-[9px] font-bold uppercase py-0.5 px-2 rounded-full font-mono bg-amber-500/15 text-amber-400">Partner</span>
                </button>

                {/* Custom Google Account Field Trigger */}
                <button
                  type="button"
                  onClick={() => setGoogleStep(2)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed text-left hover:scale-[1.01] transition-all duration-200 cursor-pointer"
                  style={{ backgroundColor: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                >
                  <div className="w-8 h-8 rounded-full border border-dashed flex items-center justify-center text-sm shrink-0" style={{ borderColor: 'var(--color-border)' }}>
                    +
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold">Use another Google Account</p>
                    <p className="text-[10px] font-mono">Input a custom email for full syncing</p>
                  </div>
                </button>
              </div>
            )}

            {/* STEP 2: Custom account input form */}
            {googleStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--color-text-secondary)' }}>Google Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="email@gmail.com"
                    value={googleCustomEmail}
                    onChange={(e) => setGoogleCustomEmail(e.target.value)}
                    className="w-full text-xs border rounded-xl px-3.5 py-3 outline-none"
                    style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--color-text-secondary)' }}>Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={googleCustomName}
                    onChange={(e) => setGoogleCustomName(e.target.value)}
                    className="w-full text-xs border rounded-xl px-3.5 py-3 outline-none"
                    style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--color-text-secondary)' }}>Company/School Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Horizon University"
                    value={googleCustomCompany}
                    onChange={(e) => setGoogleCustomCompany(e.target.value)}
                    className="w-full text-xs border rounded-xl px-3.5 py-3 outline-none"
                    style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setGoogleStep(1)}
                    className="flex-1 py-3 border text-xs font-bold rounded-xl cursor-pointer"
                    style={{ backgroundColor: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (googleCustomEmail && googleCustomName && googleCustomCompany) {
                        executeMockGoogleSignIn(googleCustomEmail, googleCustomName, googleCustomCompany);
                      }
                    }}
                    className="flex-1 py-3 text-xs font-bold rounded-xl text-white shadow-md cursor-pointer"
                    style={{ background: 'var(--accent-gradient)' }}
                  >
                    Confirm SSO
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Progress spinner */}
            {googleStep === 3 && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-neutral-700 dark:border-neutral-800 animate-spin" style={{ borderTopColor: 'var(--color-accent)' }}></div>
                </div>
                <p className="text-xs font-mono text-center animate-pulse" style={{ color: 'var(--color-text-secondary)' }}>
                  {activeLanguage === 'fr' 
                    ? 'Génération des identifiants et synchronisation...' 
                    : 'Awaiting container token validation...'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
