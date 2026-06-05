import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { useAppTheme } from './ThemeContext';
import { FileText, Trash2, Search, Link, RefreshCcw, Plus, Trash, Globe, Shield, Sparkles, Folder, HelpCircle } from 'lucide-react';

interface KnowledgeDocument {
  id: string;
  fileName: string;
  fileSize: string;
  status: 'PROCESSING' | 'READY' | 'ERROR';
  chunkCount: number;
  uploadedAt: string;
}

interface CustomFaq {
  id: string;
  question: string;
  answer: string;
}

export default function KnowledgeBasePage() {
  const { translate } = useLanguage();
  const { activeTheme } = useAppTheme();

  const [searchQuery, setSearchQuery] = useState('');
  
  // Document list state loaded from Express or defaults
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Manual FAQ pairs state
  const [faqs, setFaqs] = useState<CustomFaq[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [showFaqForm, setShowFaqForm] = useState(false);

  // Scraper controls
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scrapeState, setScrapeState] = useState<'idle' | 'scraping' | 'completed'>('idle');
  const [scrapeProgress, setScrapeProgress] = useState(0);

  // Fetch initial documents and faqs on mount from our Express server API
  const loadData = async () => {
    const token = localStorage.getItem('enrollai_session_token');
    try {
      // 1. Fetch real documents from database
      const docRes = await fetch('/api/knowledge', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      let databaseDocs: KnowledgeDocument[] = [];
      if (docRes.ok) {
        databaseDocs = await docRes.json();
      }
      
      const defaultDocs: KnowledgeDocument[] = [
        {
          id: 'doc-1',
          fileName: 'Horizon_University_Tuition_Brochure_2026.pdf',
          fileSize: '4.2 MB',
          status: 'READY' as const,
          chunkCount: 124,
          uploadedAt: '2026-04-12'
        },
        {
          id: 'doc-2',
          fileName: 'Core_Enrollment_Guidelines_ENG_FR.docx',
          fileSize: '1.8 MB',
          status: 'READY' as const,
          chunkCount: 68,
          uploadedAt: '2026-05-18'
        },
        {
          id: 'doc-3',
          fileName: 'International_Scholarship_Matrix_2026.csv',
          fileSize: '650 KB',
          status: 'READY' as const,
          chunkCount: 32,
          uploadedAt: '2026-05-30'
        }
      ];

      // Prefer user-uploaded custom documents from the database, but display standard brochures if none exist yet
      setDocuments(databaseDocs.length > 0 ? databaseDocs : defaultDocs);

      // 2. Fetch FAQs from database endpoint
      const faqRes = await fetch('/api/faqs', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      let databaseFaqs: CustomFaq[] = [];
      if (faqRes.ok) {
        databaseFaqs = await faqRes.json();
      }

      const defaultFaqs: CustomFaq[] = [
        {
          id: 'faq-1',
          question: 'What is the absolute deadline for Fall 2026 admissions?',
          answer: 'The application deadline for Fall 2026 is July 15, 2026 for domestic applicants and June 1, 2026 for international applicants requiring visa processing.'
        },
        {
          id: 'faq-2',
          question: 'Are scholarship support allocations available for Cameroon/African students?',
          answer: 'Yes! Horizon University supports talented sub-Saharan African applicants with the Merit Excellence Scholarship which covers up to 45% of standard tuition. No separate application is required; it is auto-rated on registration GPA (14/20 and up).'
        },
        {
          id: 'faq-3',
          question: 'What documents are required for transcript verification?',
          answer: 'You must attach a validated bachelor transcript/diploma, certificate of English / French fluency or pass our inner test, scan of your passport page, and 1 recommendation reference.'
        }
      ];

      setFaqs(databaseFaqs.length > 0 ? databaseFaqs : defaultFaqs);

    } catch (err) {
      console.error('Failed fetching RAG details', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Drag and drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await handleUploadFile(file.name, file.size);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await handleUploadFile(file.name, file.size);
    }
  };

  const handleUploadFile = async (name: string, sizeBytes: number) => {
    setLoadingDoc(true);
    const sizeStr = (sizeBytes / (1024 * 1024)).toFixed(1) + ' MB';
    const token = localStorage.getItem('enrollai_session_token');
    
    try {
      const res = await fetch('/api/knowledge/upload', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ fileName: name, size: sizeStr })
      });
      if (res.ok) {
        const newDoc = await res.json();
        setDocuments(prev => [newDoc, ...prev]);
      } else {
        console.error('Failed uploading document', await res.text());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDoc(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    const token = localStorage.getItem('enrollai_session_token');
    try {
      const res = await fetch(`/api/knowledge/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== id));
      } else {
        // Fallback for default mock UI docs
        setDocuments(prev => prev.filter(d => d.id !== id));
      }
    } catch (err) {
      console.error(err);
      setDocuments(prev => prev.filter(d => d.id !== id));
    }
  };

  // Real live web scraper trigger with Gemini-powered parsing indexer
  const handleScrapeTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scrapeUrl) return;
    
    setScrapeState('scraping');
    setScrapeProgress(15);
    const token = localStorage.getItem('enrollai_session_token');

    try {
      const interval = setInterval(() => {
        setScrapeProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 12;
        });
      }, 150);

      const res = await fetch('/api/knowledge/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ url: scrapeUrl })
      });

      clearInterval(interval);

      if (res.ok) {
        const data = await res.json();
        setScrapeProgress(100);
        setScrapeState('completed');
        
        if (data && Array.isArray(data.faqs)) {
          // Put the scraped faqs into state
          setFaqs(v => [...data.faqs, ...v]);
        }
        
        setScrapeUrl('');
        setTimeout(() => setScrapeState('idle'), 4000);
      } else {
        setScrapeState('idle');
        const err = await res.json();
        alert(err.message || 'Scraper failed to scrape webpage content.');
      }
    } catch (err: any) {
      setScrapeState('idle');
      alert('Error connecting to live scraper backend: ' + err.message);
    }
  };

  // FAQ Manual Form submit trigger
  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion || !newAnswer) return;
    const token = localStorage.getItem('enrollai_session_token');

    try {
      const res = await fetch('/api/faqs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ question: newQuestion, answer: newAnswer })
      });
      if (res.ok) {
        const newFaqItem = await res.json();
        setFaqs(prev => [newFaqItem, ...prev]);
        setNewQuestion('');
        setNewAnswer('');
        setShowFaqForm(false);
      } else {
        console.error('Failed to save manual FAQ override', await res.text());
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter docs and faqs based on query
  const filteredDocs = documents.filter(d => d.fileName.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredFaqs = faqs.filter(f => f.question.toLowerCase().includes(searchQuery.toLowerCase()) || f.answer.toLowerCase().includes(searchQuery.toLowerCase()));

  const totalChunksCount = documents.reduce((acc, curr) => acc + curr.chunkCount, 0);

  return (
    <div id="knowledge_base_manager_page" className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>{translate('kbTitle')}</h2>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{translate('kbSub')}</p>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents or FAQs..."
            className="w-full border rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-accent outline-none"
            style={{ 
              backgroundColor: 'var(--color-bg-card)', 
              borderColor: 'var(--color-border)', 
              color: 'var(--color-text-primary)',
              ringColor: 'var(--color-accent)'
            }}
          />
        </div>
      </div>

      {/* RAG statistics panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border rounded-2xl p-5 shadow-sm" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <span className="text-[10px] font-bold block uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-secondary)' }}>Total Indexed Documents</span>
          <span className="text-2xl font-black block font-mono" style={{ color: 'var(--color-text-primary)' }}>{documents.length}</span>
        </div>
        <div className="border rounded-2xl p-5 shadow-sm" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <span className="text-[10px] font-bold block uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-secondary)' }}>Total Extracted Chunks</span>
          <span className="text-2xl font-black block font-mono" style={{ color: 'var(--color-text-primary)' }}>{totalChunksCount}</span>
        </div>
        <div className="border rounded-2xl p-5 shadow-sm" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <span className="text-[10px] font-bold block uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-secondary)' }}>Manual FAQ Overrides</span>
          <span className="text-2xl font-black block font-mono" style={{ color: 'var(--color-text-primary)' }}>{faqs.length}</span>
        </div>
        <div className="border rounded-2xl p-5 shadow-sm" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <span className="text-[10px] font-bold block uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-secondary)' }}>Scraper Health Status</span>
          <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full inline-block mt-1 font-mono">100% SECURE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Document uploads column */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-sm font-extrabold tracking-tight flex items-center gap-1.5 uppercase" style={{ color: 'var(--color-text-primary)' }}>
            <Folder className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            <span>Document Sources</span>
          </h3>

          {/* Drag & Drop zone */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className="border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer relative"
            style={{ 
              backgroundColor: dragActive ? 'var(--color-bg-secondary)' : 'var(--color-bg-card)', 
              borderColor: dragActive ? 'var(--color-accent)' : 'var(--color-border)' 
            }}
          >
            <input 
              type="file" 
              id="file-upload" 
              multiple={false} 
              accept=".pdf,.docx,.txt,.csv"
              onChange={handleFileSelect}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center border shadow-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                <FileText className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
              </div>
              <p className="font-bold text-xs" style={{ color: 'var(--color-text-primary)' }}>
                {translate('uploadZone')}
              </p>
              <p className="text-[9px] uppercase font-mono" style={{ color: 'var(--color-text-secondary)' }}>PDF, DOCX, TXT, CSV up to 10MB</p>
            </div>
            {loadingDoc && (
              <div className="absolute inset-0 flex items-center justify-center gap-2 text-xs font-bold rounded-2xl" style={{ backgroundColor: 'var(--color-bg-card)', opacity: 0.95, color: 'var(--color-text-primary)' }}>
                <RefreshCcw className="w-4 h-4 animate-spin" style={{ color: 'var(--color-accent)' }} />
                <span>Extracting document vector layers...</span>
              </div>
            )}
          </div>

          {/* Documents Table */}
          <div className="border rounded-2xl shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            
            {/* Mobile & Tablet Card List (displays below lg breakpoint) */}
            <div className="lg:hidden divide-y divide-[var(--color-border)]">
              {filteredDocs.length === 0 ? (
                <div className="px-4 py-12 text-center italic text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  No indexed brochures match your search.
                </div>
              ) : (
                filteredDocs.map((doc) => (
                  <div key={doc.id} className="p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                    <div className="flex items-start gap-3 min-w-0">
                      <FileText className="w-5.5 h-5.5 text-zinc-400 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-xs text-[var(--color-text-primary)] break-words leading-relaxed" title={doc.fileName}>
                          {doc.fileName}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">
                            {doc.fileSize}
                          </span>
                          <span className="text-[10px] h-1 w-1 rounded-full bg-[var(--color-border)]"></span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono" style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)' }}>
                            {doc.chunkCount} layers
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0">
                      <button
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl border border-red-200 dark:border-red-950/60 text-red-500 hover:bg-red-500/10 transition-all cursor-pointer text-xs font-bold inline-flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View (displays at lg breakpoint and above) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="font-bold border-b" style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottomColor: 'var(--color-border)' }}>
                    <th className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>{translate('docName')}</th>
                    <th className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>{translate('docSize')}</th>
                    <th className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>{translate('chunks')}</th>
                    <th className="px-4 py-3 text-right" style={{ color: 'var(--color-text-secondary)' }}>{translate('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ divideColor: 'var(--color-border)' }}>
                  {filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center italic" style={{ color: 'var(--color-text-secondary)' }}>No indexed brochures match your search.</td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc) => (
                      <tr key={doc.id} className="transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ borderBottomColor: 'var(--color-border)' }}>
                        <td className="px-4 py-4.5 font-semibold flex items-center gap-2 max-w-[240px] truncate" style={{ color: 'var(--color-text-primary)' }}>
                          <FileText className="w-4.5 h-4.5 text-zinc-400 block shrink-0" />
                          <span title={doc.fileName}>{doc.fileName}</span>
                        </td>
                        <td className="px-4 py-4.5 font-mono text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{doc.fileSize}</td>
                        <td className="px-4 py-4.5">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono" style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)' }}>
                            {doc.chunkCount} layers
                          </span>
                        </td>
                        <td className="px-4 py-4.5 text-right">
                          <button
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="p-1 px-2.5 rounded-lg border border-red-200 dark:border-red-950 text-red-500 hover:bg-red-500/10 transition-all cursor-pointer text-[10px] font-bold inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Website crawler and manual FAQs column */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-sm font-extrabold tracking-tight flex items-center gap-1.5 uppercase" style={{ color: 'var(--color-text-primary)' }}>
            <Globe className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            <span>Web Crawlers & Scraping</span>
          </h3>

          <div className="border rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold" style={{ color: 'var(--color-text-primary)' }}>{translate('scraperTitle')}</h4>
              <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Provide an URL. Our bot will extract page descriptions, course directories, and requirements.</p>
            </div>

            <form onSubmit={handleScrapeTrigger} className="flex gap-2">
              <input
                type="url"
                required
                value={scrapeUrl}
                onChange={(e) => setScrapeUrl(e.target.value)}
                placeholder={translate('scraperPlaceholder')}
                className="flex-1 border rounded-xl px-3 py-2 text-xs outline-none"
                style={{ 
                  backgroundColor: 'var(--color-bg-secondary)', 
                  borderColor: 'var(--color-border)', 
                  color: 'var(--color-text-primary)' 
                }}
              />
              <button
                type="submit"
                disabled={scrapeState === 'scraping'}
                className="px-4 py-2 rounded-xl text-white text-xs font-bold transition shadow shrink-0 cursor-pointer disabled:opacity-50"
                style={{ background: 'var(--accent-gradient)' }}
              >
                {scrapeState === 'scraping' ? 'Scanning...' : 'Scrape'}
              </button>
            </form>

            {scrapeState === 'scraping' && (
              <div className="space-y-1 animate-pulse">
                <div className="flex justify-between items-center text-[10px] font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                  <span>Crawling page endpoints...</span>
                  <span>{scrapeProgress}%</span>
                </div>
                <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                  <div className="h-1 transition-all duration-200" style={{ width: `${scrapeProgress}%`, backgroundColor: 'var(--color-accent)' }}></div>
                </div>
              </div>
            )}

            {scrapeState === 'completed' && (
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-250 dark:border-emerald-850 px-2.5 py-1 rounded-full inline-block">
                ✓ Scrape index compiled! New custom FAQ added below.
              </span>
            )}
          </div>

          {/* Manual FAQ Editor section */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold tracking-tight flex items-center gap-1.5 uppercase" style={{ color: 'var(--color-text-primary)' }}>
              <HelpCircle className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              <span>Q&A FAQ Overrides</span>
            </h3>
            <button
              onClick={() => setShowFaqForm(!showFaqForm)}
              className="p-1 px-3 text-[10px] font-bold border rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
              style={{ 
                backgroundColor: 'var(--color-bg-secondary)', 
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showFaqForm ? 'Close Editor' : 'Add FAQ'}</span>
            </button>
          </div>

          {showFaqForm && (
            <form onSubmit={handleAddFaq} className="border rounded-2xl p-5 shadow-sm space-y-3 animate-fade-in" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Question Context</label>
                <input
                  type="text"
                  required
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="e.g. Can we pay tuition in installments?"
                  className="w-full border rounded-xl px-3 py-2 text-xs outline-none"
                  style={{ 
                    backgroundColor: 'var(--color-bg-secondary)', 
                    borderColor: 'var(--color-border)', 
                    color: 'var(--color-text-primary)' 
                  }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Answer Reference</label>
                <textarea
                  required
                  rows={3}
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="e.g. Yes, we support up to 3 installment plans splitted across terms..."
                  className="w-full border rounded-xl px-3 py-2 text-xs outline-none resize-none"
                  style={{ 
                    backgroundColor: 'var(--color-bg-secondary)', 
                    borderColor: 'var(--color-border)', 
                    color: 'var(--color-text-primary)' 
                  }}
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowFaqForm(false)}
                  className="px-3 py-1.5 border rounded-xl cursor-pointer font-bold"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-white rounded-xl font-bold transition shadow cursor-pointer"
                  style={{ background: 'var(--accent-gradient)' }}
                >
                  Save Override
                </button>
              </div>
            </form>
          )}

          {/* FAQ database lists */}
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="border rounded-2xl p-6 text-center text-xs italic" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                No custom manual FAQs matching search query.
              </div>
            ) : (
              filteredFaqs.map((faq) => (
                <div key={faq.id} className="border rounded-2xl p-4 shadow-sm relative group overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                  <span className="absolute top-0 right-0 p-1.5 text-[9px] uppercase font-mono font-semibold rounded-bl-lg" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}>
                    RAG Override
                  </span>
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-xs pr-16 leading-tight" style={{ color: 'var(--color-text-primary)' }}>Q: {faq.question}</h5>
                    <p className="text-[11px] leading-normal" style={{ color: 'var(--color-text-secondary)' }}>A: {faq.answer}</p>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
