import React from 'react';
import { useLanguage } from './LanguageContext';
import { CheckCircle, Circle, Play, ArrowRight, X } from 'lucide-react';

interface ChecklistStep {
  id: number;
  label: string;
  tabKey: string;
  completed: boolean;
}

interface OnboardingChecklistProps {
  steps: ChecklistStep[];
  onToggleStep: (id: number) => void;
  onNavigateTab: (tab: string) => void;
  onDismiss: () => void;
}

export default function OnboardingChecklist({ steps, onToggleStep, onNavigateTab, onDismiss }: OnboardingChecklistProps) {
  const { translate } = useLanguage();
  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div id="onboarding_checklist_card" className="border rounded-2xl p-5 mb-6 shadow-sm relative transition-all" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
      <button 
        onClick={onDismiss}
        className="absolute top-4 right-4 text-neutral-450 hover:text-neutral-600 transition-colors cursor-pointer"
        title="Dismiss checklist"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-extrabold tracking-tight flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: 'var(--color-accent)' }}></span>
            <span>{translate('checklistTitle')}</span>
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            {translate('checklistDesc')}
          </p>
        </div>

        {/* Dynamic Progress indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-32 rounded-full h-2" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            <div 
              className="h-2 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%`, backgroundColor: 'var(--color-accent)' }}
            ></div>
          </div>
          <span className="text-xs font-bold font-mono" style={{ color: 'var(--color-text-secondary)' }}>{progressPercent}% done ({completedCount}/{steps.length})</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        {steps.map((step) => {
          const stepKey = `step${step.id}` as any;
          // Dynamically obtain localized label
          const label = translate(stepKey) || step.label;

          return (
            <div 
              key={step.id} 
              className="border rounded-xl p-3.5 flex flex-row lg:flex-col justify-between items-center lg:items-stretch transition-all gap-3 overflow-hidden"
              style={step.completed 
                ? { backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', opacity: 0.6 }
                : { backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }
              }
            >
              <div className="flex items-center lg:items-start gap-2.5 max-w-[80%] lg:max-w-none">
                <button 
                  onClick={() => onToggleStep(step.id)}
                  className="shrink-0 transition-transform hover:scale-110 cursor-pointer"
                  style={{ color: 'var(--color-accent)' }}
                >
                  {step.completed ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </button>
                <p className="text-[11px] font-semibold leading-tight text-left" style={{ color: 'var(--color-text-primary)' }}>
                  {label}
                </p>
              </div>

              {!step.completed && (
                <button
                  onClick={() => onNavigateTab(step.tabKey)}
                  className="inline-flex items-center gap-1 text-[11px] lg:text-[10px] font-bold justify-end hover:underline cursor-pointer text-right shrink-0"
                  style={{ color: 'var(--color-accent)' }}
                >
                  <span>Configure</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
