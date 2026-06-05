import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, ArrowRight, Wand2, Sparkles, X } from 'lucide-react';

interface ConfigurationReminderWidgetProps {
  onResumeWizard: () => void;
  onboarded: boolean;
  tenantProfile: any;
}

export default function ConfigurationReminderWidget({ 
  onResumeWizard, 
  onboarded, 
  tenantProfile 
}: ConfigurationReminderWidgetProps) {
  // Use React state initialized from localStorage to persist dismissal across actions and re-renders
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('enrollai_dismissed_setup_popup') === 'true';
  });

  const handleDismiss = () => {
    localStorage.setItem('enrollai_dismissed_setup_popup', 'true');
    setIsDismissed(true);
  };

  // If the user is fully onboarded or has clicked dismiss, do not render the overlay reminder
  if (onboarded || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <div 
        id="configuration-overlay-container" 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 dark:bg-zinc-950/70 backdrop-blur-xs"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full max-w-md overflow-hidden rounded-2xl border bg-white dark:bg-zinc-900 shadow-2xl p-5 md:p-6 space-y-4 relative text-left"
          style={{ 
            borderColor: 'var(--color-border)', 
            backgroundColor: 'var(--color-bg-card)',
          }}
        >
          {/* Close/Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1.5 rounded-full border hover:bg-neutral-50 dark:hover:bg-zinc-805 transition-all cursor-pointer text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            style={{ borderColor: 'var(--color-border)' }}
            title="Dismiss Reminder"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Icon & Title */}
          <div className="flex items-start gap-3.5 pr-6">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
              style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)' }}
            >
              <AlertCircle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-500 dark:text-amber-450 font-mono block">
                Onboarding Setup Incomplete
              </span>
              <h4 className="text-sm font-black mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
                Configure Your Institutional Assistant
              </h4>
            </div>
          </div>

          {/* Contextual Description */}
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Hey <strong className="font-extrabold" style={{ color: 'var(--color-text-primary)' }}>{tenantProfile?.name || tenantProfile?.email?.split('@')[0] || 'there'}</strong>! Your virtual enrollment team has not been activated. Set up your specialized AI agent, customize parameters, and seed your knowledge base to begin receiving automated leads.
          </p>

          {/* Progress / Step checklist landmarks */}
          <div className="rounded-xl border p-3.5 space-y-2.5 bg-neutral-50/50 dark:bg-zinc-900/30" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Pending Action Checklist:</span>
            </div>
            <ul className="space-y-2 text-[11px] font-medium pl-1">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span style={{ color: 'var(--color-text-primary)' }}>Define study verticals, welcome prompts & themes</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span style={{ color: 'var(--color-text-primary)' }}>Corroborate training corpus/FAQ data sets</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                <span className="opacity-75" style={{ color: 'var(--color-text-secondary)' }}>Embed floating interactive site widget</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons Container */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <button
              onClick={onResumeWizard}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-white text-xs font-bold transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] shadow-md flex items-center justify-center gap-2 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}
            >
              <Wand2 className="w-4 h-4" />
              <span>Launch Wizard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-bold border transition-colors hover:bg-neutral-50 dark:hover:bg-zinc-800 cursor-pointer text-center"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
