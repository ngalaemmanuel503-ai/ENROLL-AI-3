import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { useAppTheme } from './ThemeContext';
import { 
  CreditCard, Check, HelpCircle, Download, FileText, Smartphone, 
  Shield, Sparkles, Building, Briefcase, Trash2, Plus, Edit2, 
  Wallet, RefreshCcw, Bell, AlertTriangle, ExternalLink, X, ChevronRight, Loader2
} from 'lucide-react';

interface BillingPageProps {
  leadsCount?: number;
  convsCount?: number;
}

interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  phone: string;
  gateway: 'campay' | 'paypal';
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
  externalReference: string;
  planTier: string;
  billingCycle: 'monthly' | 'annual';
  createdAt: string;
}

export default function BillingPage({ leadsCount = 15, convsCount = 124 }: BillingPageProps) {
  const { translate } = useLanguage();
  const { activeTheme } = useAppTheme();
  const [isAnnual, setIsAnnual] = useState(false);
  
  // High-fidelity active status loaded dynamically from database
  const [activePlan, setActivePlan] = useState<'Starter' | 'Growth' | 'Professional' | 'Agency'>('Growth');
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isLoadingMain, setIsLoadingMain] = useState(false);

  // Checkout modal states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<'Starter' | 'Growth' | 'Professional' | 'Agency'>('Growth');
  const [selectedGateway, setSelectedGateway] = useState<'campay' | 'paypal_wallet' | 'paypal_card'>('campay');
  
  // CamPay transaction states
  const [momoOperator, setMomoOperator] = useState<'mtn' | 'orange'>('mtn');
  const [momoPhone, setMomoPhone] = useState(() => localStorage.getItem('enrollai_momo_phone') || '677000000');
  const [momoHolder, setMomoHolder] = useState(() => localStorage.getItem('enrollai_momo_holder') || 'Admissions Wallet Account');
  
  // PayPal Card Form States
  const [paypalCardNumber, setPaypalCardNumber] = useState('4111 2222 3333 4444');
  const [paypalCardExpiry, setPaypalCardExpiry] = useState('12/28');
  const [paypalCardCvv, setPaypalCardCvv] = useState('123');
  const [paypalCardHolder, setPaypalCardHolder] = useState('Admissions Director');

  // Processing checkout states
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'initiating' | 'polling' | 'success' | 'failed'>('idle');
  const [checkoutLog, setCheckoutLog] = useState<string[]>([]);
  const [activeReference, setActiveReference] = useState<string>('');
  const [pollCountdown, setPollCountdown] = useState(60);

  // Load backend tenant state and actual payments on mount
  const refreshBillingState = async () => {
    const token = localStorage.getItem('enrollai_session_token');
    setIsLoadingMain(true);
    try {
      // 1. Load active plan tier from tenant entity
      const meRes = await fetch('/api/tenant/me', {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.plan) {
          setActivePlan(meData.plan);
        }
      }

      // 2. Load payment transactions
      const txRes = await fetch('/api/payment/transactions', {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData);
      }
    } catch (err) {
      console.error('Failed to coordinate payment transaction metrics:', err);
    } finally {
      setIsLoadingMain(false);
    }
  };

  useEffect(() => {
    refreshBillingState();
  }, []);

  // Poll status loop for Campay secure settlements
  useEffect(() => {
    if (checkoutStatus !== 'polling' || !activeReference) return;

    let timer: NodeJS.Timeout;
    const pollInterval = setInterval(async () => {
      const token = localStorage.getItem('enrollai_session_token');
      try {
        setCheckoutLog(prev => [...prev, `🔍 Querying settlement status for Ref: ${activeReference}...`]);
        const res = await fetch(`/api/payment/campay/status/${activeReference}`, {
          headers: { 'Authorization': token ? `Bearer ${token}` : '' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'SUCCESSFUL') {
            setCheckoutStatus('success');
            setCheckoutLog(prev => [...prev, `🎉 SUCCESS: Campay collection completed and verified! Upgrade applied successfully.`]);
            clearInterval(pollInterval);
            refreshBillingState();
          } else if (data.status === 'FAILED') {
            setCheckoutStatus('failed');
            setCheckoutLog(prev => [...prev, `❌ FAILED: Mobile money transaction was declines or expired.`]);
            clearInterval(pollInterval);
          }
        }
      } catch (err: any) {
        console.error('Campay polling helper fail', err);
      }
    }, 3000);

    // Limit window to 60 seconds of maximum checking
    const timerCountdown = setInterval(() => {
      setPollCountdown(prev => {
        if (prev <= 1) {
          clearInterval(pollInterval);
          clearInterval(timerCountdown);
          setCheckoutStatus('failed');
          setCheckoutLog(prevLog => [...prevLog, `⏳ TIMEOUT: Awaiting USSD prompt approval exceeded 60s limit.`]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(timerCountdown);
    };
  }, [checkoutStatus, activeReference]);

  const plans = [
    {
      id: 'Starter' as const,
      name: translate('StarterName'),
      price_monthly: 49,
      price_annual: 39,
      limit_convs: '1 widget • 500 convs / mo',
      features: ['1 Website Widget Domain', '500 AI model conversations', 'Standard Lead capture fields', 'Standard geographic indicators', 'English & French basic switches', 'Standard Email ticket support']
    },
    {
      id: 'Growth' as const,
      name: translate('GrowthName'),
      price_monthly: 99,
      price_annual: 79,
      limit_convs: '3 widgets • 5,000 convs / mo',
      features: ['3 Website Widget Domains', '5,000 AI model conversations', 'Intelligent proactive triggers', 'Conversational Scheduler Integration', 'Full detailed Visitor Geo tracking', 'Advisor human takeover inbox', 'Priority email priority cues'],
      popular: true
    },
    {
      id: 'Professional' as const,
      name: translate('ProName'),
      price_monthly: 199,
      price_annual: 159,
      limit_convs: 'Unlimited widgets • 50,000 chats / mo',
      features: ['Unlimited Website Widgets', 'White-labeled chat frameworks', 'Reference Document uploads (RAG)', 'Website crawler RAG indexers', 'Collaborative shared advisor seats', 'Direct CRM exports syncing', 'Dedicated account manager']
    },
    {
      id: 'Agency' as const,
      name: translate('AgencyName'),
      price_monthly: 499,
      price_annual: 399,
      limit_convs: 'Reseller dashboard limits',
      features: ['Multi-tenant organization creator', 'White-label Reseller permissions', 'Uncapped client analytics', 'Manage unlimited sub-contract schemes', 'Direct webhook API access hooks', 'Strict custom SLA guarantees']
    }
  ];

  // Helper helper conversions (MTN & Orange mobile money require domestic currency payment)
  const USD_TO_FCFA_RATE = 600;

  // Static archival invoices fallback merged with live db records
  const defaultLedger = [
    { id: 'inv-03', date: '2026-05-01', gateway: 'paypal', desc: 'Overlimit Conversions (May 15 incident)', status: 'paid', amount: 15, currency: 'USD' },
    { id: 'inv-02', date: '2026-04-12', gateway: 'paypal', desc: 'Knowledge Training API token usage', status: 'paid', amount: 4, currency: 'USD' },
    { id: 'inv-01', date: '2026-03-01', gateway: 'campay', desc: 'EnrollAI Signup Starter validation fee', status: 'paid', amount: 1000, currency: 'XAF' }
  ];

  const handleOpenCheckout = (planId: 'Starter' | 'Growth' | 'Professional' | 'Agency') => {
    setCheckoutPlan(planId);
    setCheckoutStatus('idle');
    setCheckoutLog([]);
    setPollCountdown(60);
    setIsCheckoutOpen(true);
  };

  // Triggering local payment collection via Campay Express route
  const handleInitiateCampay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!momoPhone.trim()) return;

    setCheckoutStatus('initiating');
    setCheckoutLog([
      `📢 Initiating local payment validation for Cameroon Mobile Money...`,
      `📦 Subscription Tier Chosen: ${checkoutPlan} Plan`,
      `💰 Converting billing values at 1 USD = ${USD_TO_FCFA_RATE} FCFA...`
    ]);

    const activePrice = plans.find(p => p.id === checkoutPlan);
    const usdAmount = (isAnnual ? activePrice?.price_annual || 99 : activePrice?.price_monthly || 99) * (isAnnual ? 12 : 1);
    const convertedFcfa = usdAmount * USD_TO_FCFA_RATE;

    setCheckoutLog(prev => [...prev, `💶 Total amount charge set to ${usdAmount} USD (~${convertedFcfa.toLocaleString()} FCFA).`]);

    const token = localStorage.getItem('enrollai_session_token');
    try {
      const response = await fetch('/api/payment/campay/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          amount: convertedFcfa,
          phone: momoPhone,
          momoOperator: momoOperator,
          planId: checkoutPlan,
          isAnnual: isAnnual
        })
      });

      if (response.ok) {
        const data = await response.json();
        setActiveReference(data.reference);
        setCheckoutStatus('polling');
        setCheckoutLog(prev => [
          ...prev,
          `📡 API SUCCESS: ${data.message || 'Collection reference received.'}`,
          `📲 USSD Push Notification sent onto target device (+237) ${momoPhone}`,
          `⏳ Awaiting mobile client confirmation. Please confirm the pin popup on your handphone...`
        ]);
        
        // Save current preferences to persistent storage
        localStorage.setItem('enrollai_momo_phone', momoPhone);
        localStorage.setItem('enrollai_momo_holder', momoHolder);
        localStorage.setItem('enrollai_momo_method', momoOperator.toUpperCase());
      } else {
        const err = await response.json();
        setCheckoutStatus('failed');
        setCheckoutLog(prev => [...prev, `❌ GATEWAY ERROR: ${err.message || 'Payment collection failed.'}`]);
      }
    } catch (err: any) {
      setCheckoutStatus('failed');
      setCheckoutLog(prev => [...prev, `❌ CONNECTION FAILED: Unable to establish telemetry sync with gateway.`]);
    }
  };

  // Triggering card payments via standard PayPal backend capture endpoint
  const handleInitiatePayPal = async (isCard = false) => {
    const activePrice = plans.find(p => p.id === checkoutPlan);
    const usdAmount = (isAnnual ? activePrice?.price_annual || 99 : activePrice?.price_monthly || 99) * (isAnnual ? 12 : 1);

    setCheckoutStatus('initiating');
    setCheckoutLog([
      `🔒 Securing PayPal dynamic token tunnel...`,
      `💳 Charging ${usdAmount} USD matching checkout requirement`,
      `📦 Authenticating virtual gateway credentials...`
    ]);

    const token = localStorage.getItem('enrollai_session_token');
    try {
      const bodyPayload = {
        amount: usdAmount,
        planId: checkoutPlan,
        isAnnual: isAnnual,
        orderId: `pp-order-${Date.now()}`,
        cardDetails: isCard ? { last4: paypalCardNumber.trim().slice(-4) } : undefined
      };

      const response = await fetch('/api/payment/paypal/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(bodyPayload)
      });

      if (response.ok) {
        setCheckoutStatus('success');
        setCheckoutLog(prev => [
          ...prev,
          `🎉 AUTHORIZED: Merchant authorization signed by PayPal cards protocol.`,
          `🚀 Subscription Tier set to ${checkoutPlan} successfully!`
        ]);
        refreshBillingState();
      } else {
        const err = await response.json();
        setCheckoutStatus('failed');
        setCheckoutLog(prev => [...prev, `❌ PayPal gateway reported authorization decline: ${err.message}`]);
      }
    } catch (err) {
      setCheckoutStatus('failed');
      setCheckoutLog(prev => [...prev, `❌ Network request failed to capture PayPal order.`]);
    }
  };

  const getConvsLimit = () => {
    if (activePlan === 'Starter') return 500;
    if (activePlan === 'Growth') return 5000;
    if (activePlan === 'Professional') return 50000;
    return 1000000;
  };

  const maxConvs = getConvsLimit();
  const convsPercent = Math.min(100, Math.max(1.5, Math.round((convsCount / maxConvs) * 100)));

  return (
    <div id="billing_management_page" className="space-y-6">
      
      {/* Page Title & Status */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            {translate('billTitle')}
          </h2>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Configure default local payment gateways in West/Central Africa or connect card networks.
          </p>
        </div>
        <button
          onClick={refreshBillingState}
          className="p-2 border rounded-xl hover:bg-neutral-500/10 cursor-pointer flex items-center gap-1.5 text-xs font-bold font-mono uppercase"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          <span>Sync Ledger</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Plans list column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
              <Building className="w-4 h-4 text-accent" style={{ color: 'var(--color-accent)' }} />
              <span>Subscription tiers</span>
            </h3>

            {/* Annual toggle */}
            <div className="flex flex-wrap items-center gap-2 select-none">
              <span className="text-xs font-bold" style={{ color: !isAnnual ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>Monthly billing</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="w-10 h-5.5 rounded-full p-0.5 relative transition-colors flex items-center border cursor-pointer shrink-0"
                style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
              >
                <span className={`w-4 h-4 rounded-full shadow-md transition-transform ${isAnnual ? 'translate-x-4.5' : 'translate-x-0'}`} style={{ backgroundColor: 'var(--color-accent)' }}></span>
              </button>
              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                <span className="text-xs font-bold" style={{ color: isAnnual ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>Annual billing</span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full font-mono uppercase" style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)' }}>Save 20%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((p) => {
              const currentPrice = isAnnual ? p.price_annual : p.price_monthly;
              const isSelected = activePlan === p.id;

              return (
                <div 
                  key={p.id} 
                  className={`border-2 rounded-2xl p-5 flex flex-col justify-between space-y-5 transition-all duration-300 relative overflow-hidden ${
                    isSelected ? 'shadow-lg border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]' : 'border-[var(--color-border)]'
                  }`}
                  style={{ 
                    backgroundColor: 'var(--color-bg-card)', 
                    borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-border)' 
                  }}
                >
                  {p.popular && (
                    <span className="absolute -top-1 right-0 px-3 py-1 text-white font-bold text-[9px] uppercase tracking-wider rounded-bl-xl shadow-sm z-10" style={{ background: 'var(--accent-gradient)' }}>
                      Most Purchased
                    </span>
                  )}

                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-extrabold flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
                          <span>{p.name}</span>
                          {isSelected && (
                            <span className="px-2 py-0.5 text-[8px] uppercase tracking-wider font-extrabold rounded-full shrink-0" style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)' }}>
                              Active
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] font-mono block mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{p.limit_convs}</p>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-0.5" style={{ color: 'var(--color-text-primary)' }}>
                      <span className="text-2xl font-black">$</span>
                      <span className="text-3xl font-extrabold leading-none">{currentPrice}</span>
                      <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>/ month</span>
                    </div>

                    <ul className="space-y-1.5 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                      {p.features.slice(0, 4).map((f, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-1 text-[10px] leading-tight" style={{ color: 'var(--color-text-secondary)' }}>
                          <Check className="w-3.5 h-3.5 text-accent block shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {!isSelected ? (
                    <button
                      type="button"
                      onClick={() => handleOpenCheckout(p.id)}
                      className="w-full py-2.5 text-xs font-black rounded-xl transition hover:opacity-85 cursor-pointer flex items-center justify-center text-center border mt-2 hover:bg-neutral-500/5"
                      style={{ 
                        backgroundColor: 'var(--color-bg-secondary)', 
                        borderColor: 'var(--color-border)', 
                        color: 'var(--color-text-primary)' 
                      }}
                    >
                      Process Upgrade
                    </button>
                  ) : (
                    <span 
                      className="w-full py-2.5 text-white text-xs font-black rounded-xl text-center flex items-center justify-center cursor-default select-none shadow-md mt-2"
                      style={{ background: 'var(--accent-gradient)' }}
                    >
                      Active Tier Plan
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Usage indicators */}
          <div className="border rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <h4 className="text-xs font-extrabold uppercase tracking-wide" style={{ color: 'var(--color-text-primary)' }}>Quota Usage Analytics</h4>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span style={{ color: 'var(--color-text-primary)' }}>Conversations Exchanged</span>
                  <span className="font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                    {convsCount.toLocaleString()} / {maxConvs >= 1000000 ? 'Unlimited' : maxConvs.toLocaleString()} ({convsPercent}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                  <div className="h-2.5 transition-all duration-500" style={{ width: `${convsPercent}%`, backgroundColor: 'var(--color-accent)' }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span style={{ color: 'var(--color-text-primary)' }}>Student Leads Captured</span>
                  <span className="font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                    {leadsCount.toLocaleString()} / Unlimited
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                  <div className="bg-emerald-500 h-2.5 transition-all duration-500" style={{ width: `${Math.min(100, Math.round((leadsCount / 200) * 100))}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Config Column */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
            <Wallet className="w-4 h-4 text-accent" style={{ color: 'var(--color-accent)' }} />
            <span>Cameroon CamPay Terminal</span>
          </h3>

          <div className="border rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-2">
              <div className="bg-[#FFCC00] text-[#002244] px-2 py-0.5 rounded font-black text-[9px] tracking-tight border border-amber-400">
                MoMo
              </div>
              <div className="bg-[#FF6600] text-white px-2 py-0.5 rounded font-black text-[9px] tracking-tight border border-orange-600">
                Orange Money
              </div>
            </div>

            <p className="text-[10px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Campay manages local collection across MTN & Orange networks in Cameroon. Active wallets are authorized directly via mobile USSD prompts automatically.
            </p>

            <div className="p-3 border rounded-xl space-y-2 mt-1" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between text-[10px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>
                <span>Gateway Status</span>
                <span className="text-emerald-500 flex items-center gap-1 font-mono">● ONLINE</span>
              </div>
              <div className="text-xs space-y-2">
                <div>
                  <label className="block text-[9px] font-bold uppercase mb-0.5" style={{ color: 'var(--color-text-secondary)' }}>Saved MoMo phone</label>
                  <p className="font-mono font-bold" style={{ color: 'var(--color-text-primary)' }}>{momoPhone || 'No default target linked'}</p>
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase mb-0.5" style={{ color: 'var(--color-text-secondary)' }}>Wallet owner name</label>
                  <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{momoHolder || 'No holder name'}</p>
                </div>
              </div>
            </div>
            
            <p className="text-[9px] border-l-2 pl-2 italic" style={{ borderColor: 'var(--color-accent)', color: 'var(--color-text-secondary)' }}>
              Cameroon payments collect live values to trigger internal school validation logs instant.
            </p>
          </div>

          {/* Billing Ledger/Archives */}
          <h3 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
            <FileText className="w-4 h-4 text-accent" style={{ color: 'var(--color-accent)' }} />
            <span>Billing Archives</span>
          </h3>

          <div className="border rounded-2xl shadow-sm overflow-hidden text-xs max-h-[300px] overflow-y-auto" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            {transactions.length === 0 ? (
              // If empty, display standard defaults matching requested visual plans
              defaultLedger.map((tx) => (
                <div key={tx.id} className="p-3 border-b flex justify-between items-center" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="space-y-0.5">
                    <span className="font-extrabold block truncate max-w-[150px]" style={{ color: 'var(--color-text-primary)' }}>{tx.desc}</span>
                    <span className="text-[10px] block font-mono" style={{ color: 'var(--color-text-secondary)' }}>{tx.date} • {tx.id.toUpperCase()} ({tx.gateway === 'campay' ? 'Campay Local' : 'PayPal'})</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black block font-mono" style={{ color: 'var(--color-text-primary)' }}>{tx.amount} {tx.currency}</span>
                    <button className="text-[9px] font-bold hover:underline flex items-center justify-end gap-0.5" style={{ color: 'var(--color-accent)' }}>
                      <Download className="w-2.5 h-2.5" /> PDF
                    </button>
                  </div>
                </div>
              ))
            ) : (
              // Display live database records reflecting actual transactions through our gatewway!
              transactions.map((tx) => (
                <div key={tx.id} className="p-3 border-b flex justify-between items-center" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="space-y-0.5">
                    <span className="font-extrabold block truncate max-w-[150px]" style={{ color: 'var(--color-text-primary)' }}>
                      SaaS {tx.planTier} Subscription ({tx.billingCycle})
                    </span>
                    <span className="text-[10px] block font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                      {tx.createdAt} • {tx.externalReference} ({tx.gateway === 'campay' ? 'Campay MoMo' : 'PayPal Cards'})
                    </span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      tx.status === 'SUCCESSFUL' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black block font-mono" style={{ color: 'var(--color-text-primary)' }}>
                      {tx.amount} {tx.currency}
                    </span>
                    <button className="text-[9px] font-bold hover:underline flex items-center justify-end gap-0.5 mt-1" style={{ color: 'var(--color-accent)' }}>
                      <Download className="w-2.5 h-2.5" /> Receipt
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* DETAILED upgrade modal containing CAMEROON CAMPAY & PAYPAL GATEWAY OPTIONS */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-fade-in"
            style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
          >
            {/* Close button */}
            <button 
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-neutral-500/10 cursor-pointer"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Summary Pane */}
            <div className="md:w-5/12 p-6 border-b md:border-b-0 md:border-r flex flex-col justify-between" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-accent" style={{ color: 'var(--color-accent)' }}>Checkout Summary</span>
                  <h3 className="text-lg font-black" style={{ color: 'var(--color-text-primary)' }}>{checkoutPlan} Subscription</h3>
                  <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>Upgrade will update conversational widgets immediately on successful settle.</p>
                </div>

                <div className="space-y-2 border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex justify-between text-xs font-semibold">
                    <span style={{ color: 'var(--color-text-secondary)' }}>Base Tier Cost:</span>
                    <span style={{ color: 'var(--color-text-primary)' }}>
                      ${plans.find(p => p.id === checkoutPlan)?.price_monthly}/mo
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span style={{ color: 'var(--color-text-secondary)' }}>Billing frequency:</span>
                    <span style={{ color: 'var(--color-text-primary)' }}>{isAnnual ? 'Annual (save 20%)' : 'Monthly'}</span>
                  </div>
                  
                  <div className="border-t pt-3 mt-1 space-y-1" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>Total Charge:</span>
                      <span className="text-xl font-black text-accent font-sans" style={{ color: 'var(--color-accent)' }}>
                        ${((isAnnual ? plans.find(p => p.id === checkoutPlan)?.price_annual || 99 : plans.find(p => p.id === checkoutPlan)?.price_monthly || 99) * (isAnnual ? 12 : 1)).toLocaleString()}
                      </span>
                    </div>
                    {/* Explicit Local Conversion Pricing for Cameroonians */}
                    <div className="flex justify-between items-center text-[10px] font-mono border-t border-dashed pt-1.5" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                      <span>Cameroon Rate:</span>
                      <span className="font-extrabold text-neutral-400">
                        ~{(((isAnnual ? plans.find(p => p.id === checkoutPlan)?.price_annual || 99 : plans.find(p => p.id === checkoutPlan)?.price_monthly || 99) * (isAnnual ? 12 : 1)) * USD_TO_FCFA_RATE).toLocaleString()} XAF (FCFA)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checklist indicators */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                    <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Secure 256-bit SSL Layer</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                    <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" style={{ color: 'var(--color-accent)' }} />
                    <span>Instant quota verification sync</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 text-[9px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                Collect operations handled inside Cameroon partner securely. Card transactions processed by secure PayPal express tokens.
              </div>
            </div>

            {/* Right Gateway Interactive Panel */}
            <div className="md:w-7/12 p-6 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider mb-3.5" style={{ color: 'var(--color-text-primary)' }}>Select your payment engine</h4>
                
                {/* Selector Tabs */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGateway('campay');
                      setCheckoutStatus('idle');
                    }}
                    className={`p-2.5 border rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      selectedGateway === 'campay' ? 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent)] font-bold' : ''
                    }`}
                    style={{ backgroundColor: selectedGateway === 'campay' ? 'var(--color-bg-secondary)' : 'var(--color-bg-card)', borderColor: selectedGateway === 'campay' ? 'var(--color-accent)' : 'var(--color-border)' }}
                  >
                    <Wallet className="w-4 h-4 text-accent" style={{ color: 'var(--color-accent)' }} />
                    <span className="text-[10px]" style={{ color: 'var(--color-text-primary)' }}>CamPay MoMo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGateway('paypal_card');
                      setCheckoutStatus('idle');
                    }}
                    className={`p-2.5 border rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      selectedGateway === 'paypal_card' ? 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent)] font-bold' : ''
                    }`}
                    style={{ backgroundColor: selectedGateway === 'paypal_card' ? 'var(--color-bg-secondary)' : 'var(--color-bg-card)', borderColor: selectedGateway === 'paypal_card' ? 'var(--color-accent)' : 'var(--color-border)' }}
                  >
                    <CreditCard className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px]" style={{ color: 'var(--color-text-primary)' }}>PayPal Cards</span>
                  </button>
                </div>

                {/* Conditional Sub-panels content fields */}
                {checkoutStatus === 'idle' ? (
                  <>
                    {/* CAMEROON CAMPAY COMPONENT */}
                    {selectedGateway === 'campay' && (
                      <form onSubmit={handleInitiateCampay} className="space-y-3 animate-fade-in text-xs">
                        <div className="p-3 border rounded-xl flex items-center justify-between" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                          <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-text-secondary)' }}>Carrier Operator:</span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setMomoOperator('mtn')}
                              className={`px-3 py-1.5 rounded font-black text-[9px] border transition-transform ${
                                momoOperator === 'mtn' ? 'bg-[#FFCC00] text-[#002244] border-amber-400 scale-105' : 'bg-transparent border-neutral-500 opacity-60'
                              }`}
                            >
                              MTN MoMo
                            </button>
                            <button
                              type="button"
                              onClick={() => setMomoOperator('orange')}
                              className={`px-3 py-1.5 rounded font-black text-[9px] border transition-transform ${
                                momoOperator === 'orange' ? 'bg-[#FF6600] text-white border-orange-600 scale-105' : 'bg-transparent border-neutral-500 opacity-60'
                              }`}
                            >
                              Orange Money
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase mb-1" style={{ color: 'var(--color-text-secondary)' }}>Cameroon Wallet number</label>
                          <div className="flex gap-1.5">
                            <span className="bg-stone-150 border px-3 py-2 rounded-xl text-neutral-400 font-bold flex items-center shrink-0 font-mono" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                              +237
                            </span>
                            <input
                              type="tel"
                              required
                              placeholder="677 88 99 22"
                              value={momoPhone}
                              onChange={(e) => setMomoPhone(e.target.value)}
                              className="w-full p-2 border rounded-xl outline-none font-mono"
                              style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                            />
                          </div>
                          <span className="text-[9px] block mt-1" style={{ color: 'var(--color-text-secondary)' }}>Enter a registered MTN or Orange Money phone number.</span>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase mb-1" style={{ color: 'var(--color-text-secondary)' }}>Registered Wallet Account name</label>
                          <input
                            type="text"
                            required
                            placeholder="Emmanuel admissions"
                            value={momoHolder}
                            onChange={(e) => setMomoHolder(e.target.value)}
                            className="w-full p-2 border rounded-xl outline-none"
                            style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full mt-4 py-2.5 rounded-xl font-black text-white hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-[1.01] transition-transform"
                          style={{ background: 'var(--accent-gradient)' }}
                        >
                          <Smartphone className="w-4 h-4 animate-bounce" />
                          <span>Payer avec CamPay ({momoOperator.toUpperCase()})</span>
                        </button>
                      </form>
                    )}

                    {/* PAYPAL CARDS COMPONENT */}
                    {selectedGateway === 'paypal_card' && (
                      <div className="space-y-3.5 animate-fade-in text-xs">
                        <div className="p-3 border rounded-xl flex items-center justify-between" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                          <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-text-secondary)' }}>Processed securely via:</span>
                          <span className="font-extrabold italic text-blue-500 tracking-wider">PayPal Cards Terminal</span>
                        </div>

                        {/* Interactive dynamic Credit Card display visualizer */}
                        <div className="rounded-xl p-4 text-white flex flex-col justify-between h-28 shadow-xl bg-gradient-to-tr from-amber-700 to-yellow-500">
                          <div className="flex justify-between items-start">
                            <span className="text-[8px] font-bold font-mono tracking-widest text-stone-100 uppercase">INTERNATIONAL SCHOOL PLATFORM</span>
                            <span className="text-[10px] font-black italic tracking-wide">VISA</span>
                          </div>
                          <span className="text-sm font-extrabold font-mono tracking-widest select-none">
                            {paypalCardNumber || '•••• •••• •••• ••••'}
                          </span>
                          <div className="flex justify-between text-[8px] font-mono">
                            <span className="truncate max-w-[120px] uppercase">{paypalCardHolder || 'CARDHOLDER NAME'}</span>
                            <span>EXP: {paypalCardExpiry || 'MM/YY'}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <label className="block text-[10px] font-bold uppercase mb-0.5" style={{ color: 'var(--color-text-secondary)' }}>Card Number Only</label>
                            <input
                              type="text"
                              required
                              value={paypalCardNumber}
                              onChange={(e) => setPaypalCardNumber(e.target.value)}
                              placeholder="4111 2222 3333 4444"
                              className="w-full p-2 border rounded-xl outline-none font-mono"
                              style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold uppercase mb-0.5" style={{ color: 'var(--color-text-secondary)' }}>Expiration</label>
                              <input
                                type="text"
                                required
                                value={paypalCardExpiry}
                                onChange={(e) => setPaypalCardExpiry(e.target.value)}
                                placeholder="MM/YY"
                                className="w-full p-2 border rounded-xl outline-none font-mono"
                                style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase mb-0.5" style={{ color: 'var(--color-text-secondary)' }}>CVV / CVN</label>
                              <input
                                type="password"
                                maxLength={4}
                                required
                                value={paypalCardCvv}
                                onChange={(e) => setPaypalCardCvv(e.target.value)}
                                placeholder="•••"
                                className="w-full p-2 border rounded-xl outline-none font-mono tracking-widest"
                                style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase mb-0.5" style={{ color: 'var(--color-text-secondary)' }}>Cardholder NAME</label>
                            <input
                              type="text"
                              required
                              value={paypalCardHolder}
                              onChange={(e) => setPaypalCardHolder(e.target.value)}
                              placeholder="Dean of Administrations"
                              className="w-full p-2 border rounded-xl outline-none"
                              style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleInitiatePayPal(true)}
                          className="w-full mt-2 py-2.5 rounded-xl font-black text-white hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-[1.01] transition-transform bg-amber-500"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Process Card Payment via PayPal</span>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  // LOGGING & STEP SEQUENCER LAYOUT FOR LIVE STATUS CHECKS
                  <div className="bg-stone-50 dark:bg-stone-900/50 rounded-2xl p-5 border shadow-sm space-y-4 animate-fade-in" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span style={{ color: 'var(--color-text-primary)' }}>Interactive Transaction Trace</span>
                      
                      {checkoutStatus === 'polling' && (
                        <span className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded font-mono text-[10px] animate-pulse flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Polling status ({pollCountdown}s)
                        </span>
                      )}

                      {checkoutStatus === 'success' && (
                        <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-500 rounded font-bold text-[10px]">
                          ✓ Applied
                        </span>
                      )}

                      {checkoutStatus === 'failed' && (
                        <span className="px-2.5 py-1 bg-red-500/15 text-red-500 rounded font-bold text-[10px]">
                          Declined
                        </span>
                      )}
                    </div>

                    {/* Step log list lines */}
                    <div className="h-36 overflow-y-auto font-mono text-[10px] leading-relaxed p-3 border rounded-xl bg-black/5 dark:bg-black/30 space-y-1" style={{ borderColor: 'var(--color-border)' }}>
                      {checkoutLog.map((log, index) => (
                        <p key={index} style={{ color: log.startsWith('✓') || log.startsWith('🎉') ? '#10B981' : log.startsWith('❌') ? '#EF4444' : 'var(--color-text-secondary)' }}>
                          {log}
                        </p>
                      ))}
                    </div>

                    {/* Control workflow buttons */}
                    <div className="flex gap-2 justify-end text-xs">
                      {checkoutStatus === 'polling' && (
                        <div className="flex-1 text-[10px] italic flex items-center" style={{ color: 'var(--color-text-secondary)' }}>
                          📱 Tap dial-pad pin on your MTN/Orange phone now!
                        </div>
                      )}

                      {(checkoutStatus === 'success' || checkoutStatus === 'failed') && (
                        <button
                          type="button"
                          onClick={() => {
                            if (checkoutStatus === 'success') {
                              setIsCheckoutOpen(false);
                            } else {
                              setCheckoutStatus('idle');
                            }
                          }}
                          className="px-4 py-2 rounded-xl text-white font-bold cursor-pointer"
                          style={{ backgroundColor: 'var(--color-accent)' }}
                        >
                          {checkoutStatus === 'success' ? 'Go back' : 'Retry Payment'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-[10px] flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Partnering with CamPay Cameroon & PayPal Commerce.</span>
                <span className="font-mono text-[9px]" style={{ color: 'var(--color-accent)' }}>SECURE PIPELINE</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
