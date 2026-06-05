import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'fr';

const TRANSLATIONS = {
  en: {
    // Nav & Common
    landing: 'Home',
    dashboard: 'Dashboard',
    leads: 'Leads',
    conversations: 'Conversations',
    knowledgeBase: 'Knowledge Base',
    programs: 'Programs',
    appointments: 'Appointments',
    reports: 'Reports',
    widgetConfig: 'Widget Config',
    billing: 'Billing',
    settings: 'Settings',
    logout: 'Logout',
    language: 'Language',
    theme: 'Theme',
    save: 'Save Changes',
    cancel: 'Cancel',
    upload: 'Upload',
    active: 'Active',
    trialActive: 'You are on a free trial — {days} days remaining.',
    upgradeNow: 'Upgrade now',
    go_to_dashboard: 'Go to Dashboard',

    // Landing Page
    landingTitle: 'Turn Late-Night Web Visits into Student Enrollments',
    landingSubtitle: 'Deploy 24/7 RAG-powered AI assistants that capture student details, answer program questions, and book advising calls automatically.',
    getStartedButton: 'Start Free 14-Day Trial',
    tryDemoButton: 'View Live Demo',
    problemTitle: 'Why schools lose enrollments at night',
    problemPain1: 'Unattended Visits',
    problemPainDesc1: '80% of prospective students search for programs in the evening. If they have a question and get no response, they leave and visit a competitor.',
    problemPain2: 'Form Friction',
    problemPainDesc2: 'Standard static contact forms convert under 3%. Modern applicants prefer instant interactive answers over wait times.',
    problemBefore: 'Before EnrollAI',
    problemAfter: 'After EnrollAI',

    // Onboarding Dashboard Checklist
    checklistTitle: 'Your Quick Setup Onboarding Checklist',
    checklistDesc: 'Complete these quick steps to fully launch your conversational enrollment funnel:',
    step1: 'Set your bot name and accent color',
    step2: 'Upload your program brochure or enter FAQs',
    step3: 'Test and configure triggers in the configuration page',
    step4: 'Copy and embed the widget script tag on your school website',
    step5: 'Invite your first team member or student advisor',

    // Knowledge Base Page
    kbTitle: 'AI Knowledge Base Manager',
    kbSub: 'Manage the reference database your AI uses to construct high-confidence RAG answers.',
    uploadZone: 'Drag and drop program brochures, PDFs, or fee structures here, or click to browse files',
    docName: 'File Name',
    docSize: 'Size',
    docDate: 'Uploaded',
    docStatus: 'Status',
    chunks: 'Chunks',
    actions: 'Actions',
    manualFaq: 'Manual Q&A Direct Entries',
    addFaq: 'Add Custom FAQ',
    faqQuestion: 'Question',
    faqAnswer: 'Answer',
    faqSuccess: 'FAQ item saved successfully!',
    scraperTitle: 'Website Content Scraper',
    scraperPlaceholder: 'Enter program page URL (e.g. https://yourschool.edu/programs/mba)',
    scrapeButton: 'Scrape URL',
    processedTitle: 'Sources Utilized',

    // Widget Elements
    botHeaderOnline: 'Replies instantly',
    collectLeadTitle: 'Connect with an Advisor',
    collectLeadDesc: 'Fill in your details so we can send customized information and help you enroll.',
    fullNameField: 'Full Name',
    emailField: 'Email Address',
    phoneField: 'Phone Number',
    countryField: 'Country of Residence',
    programSelectField: 'Program of Interest',
    startDateField: 'Target Start Date',
    submitField: 'Submit & Continue',
    sending: 'Sending...',
    successLeadMessage: 'Thanks! An advisor will contact you within 24 hours. Check your email for confirmation.',
    bookCallTitle: 'Schedule a Call',
    bookCallDesc: 'Select an available appointment with our Admissions Advisor:',
    confirmBooking: 'Schedule Call',
    bookSuccessMessage: 'Your advising appointment is set and confirmed! Check your inbox for video links.',
    humanHandoffHeader: 'Live Advisor Rescue',
    humanHandoffConnected: 'Connecting you to an advisor...',
    advisorWaitTime: 'Approximate wait: < 2 minutes',
    advisorFallbackMsg: 'If we take more than a minute, leave an offline note below.',
    whatsAppCTA: 'Continue on WhatsApp',
    citationLabel: 'Source:',

    // Billing
    billTitle: 'Plan Subscription & Billing Portal',
    billSub: 'Configure your SaaS tier limits, manage invoices, or hook up Flutterwave/Stripe.',
    currentPlan: 'Current Subscription',
    annualDiscount: 'Save 20% by billing annually',
    StarterName: 'Starter',
    GrowthName: 'Growth',
    ProName: 'Professional',
    AgencyName: 'Agency'
  },
  fr: {
    // Nav & Common
    landing: 'Accueil',
    dashboard: 'Tableau de bord',
    leads: 'Prospects',
    conversations: 'Conversations',
    knowledgeBase: 'Base de connaissances',
    programs: 'Programmes',
    appointments: 'Rendez-vous',
    reports: 'Rapports',
    widgetConfig: 'Config Widget',
    billing: 'Facturation',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    language: 'Langue',
    theme: 'Thème',
    save: 'Enregistrer',
    cancel: 'Annuler',
    upload: 'Téléverser',
    active: 'Actif',
    trialActive: 'Période d\'essai gratuite — {days} jours restants.',
    upgradeNow: 'Mettre à niveau',
    go_to_dashboard: 'Aller au Tableau de bord',

    // Landing Page
    landingTitle: 'Transformez les Visites de Nuit en Inscriptions Scolaires',
    landingSubtitle: 'Déployez des assistants IA alimentés par RAG 24h/24 qui capturent les coordonnées des étudiants, répondent aux détails du programme et fixent des rendez-vous.',
    getStartedButton: 'Commencer l\'essai de 14 jours',
    tryDemoButton: 'Voir la Démo Interactive',
    problemTitle: 'Pourquoi les écoles perdent des étudiants la nuit',
    problemPain1: 'Visiteurs Abandonnés',
    problemPainDesc1: '80% des futurs étudiants recherchent des programmes le soir. Sans réponse instantanée, ils partent chez la concurrence.',
    problemPain2: 'Friction des Formulaires',
    problemPainDesc2: 'Les formulaires classiques ont un taux de conversion inférieur à 3%. Les jeunes préfèrent un chatbot intelligent.',
    problemBefore: 'Avant EnrollAI',
    problemAfter: 'Après EnrollAI2',

    // Onboarding Dashboard Checklist
    checklistTitle: 'Votre guide de démarrage rapide',
    checklistDesc: 'Suivez ces étapes clés pour lancer efficacement votre assistant d\'inscription numérique :',
    step1: 'Configurez le nom de l\'assistant et sa couleur d\'accentuation',
    step2: 'Téléversez vos brochures ou listez vos Questions/Réponses (FAQ)',
    step3: 'Testez et activez les déclencheurs intelligents dans la config',
    step4: 'Intégrez le script JavaScript dans le footer de votre site web',
    step5: 'Invitez votre premier conseiller ou administrateur',

    // Knowledge Base Page
    kbTitle: 'Gestionnaire de la base de données',
    kbSub: 'Gérez les documents et sources que votre IA utilise pour générer des réponses RAG haute fidélité.',
    uploadZone: 'Glissez-déposez un fichier PDF, DOCX, ou barème de prix ici, ou cliquez pour parcourir',
    docName: 'Nom du fichier',
    docSize: 'Taille',
    docDate: 'Téléversé le',
    docStatus: 'Statut',
    chunks: 'Fragments',
    actions: 'Actions',
    manualFaq: 'Saisie Directe de FAQ Manuelle',
    addFaq: 'Ajouter une FAQ personnalisée',
    faqQuestion: 'Question',
    faqAnswer: 'Réponse',
    faqSuccess: 'FAQ enregistrée avec succès !',
    scraperTitle: 'Scraper de contenu Web',
    scraperPlaceholder: 'Saisissez l\'URL de la page (ex: https://ecole.edu/programmes/mba)',
    scrapeButton: 'Scraper l\'URL',
    processedTitle: 'Sources Appliquées',

    // Widget Elements
    botHeaderOnline: 'Répond instantanément',
    collectLeadTitle: 'Contacter un Conseiller',
    collectLeadDesc: 'Laissez vos coordonnées pour recevoir des brochures personnalisées et vous inscrire.',
    fullNameField: 'Nom Complet',
    emailField: 'Adresse Email',
    phoneField: 'Numéro de Téléphone',
    countryField: 'Pays de Résidence',
    programSelectField: 'Programme d\'intérêt',
    startDateField: 'Date de rentrée ciblée',
    submitField: 'Soumettre et Continuer',
    sending: 'Envoi...',
    successLeadMessage: 'Merci ! Un conseiller vous contactera sous 24 heures. Consultez votre boîte de réception.',
    bookCallTitle: 'Prendre Rendez-vous',
    bookCallDesc: 'Planifiez un appel téléphonique ou vidéo avec notre conseiller d\'orientation :',
    confirmBooking: 'Confirmer le RDV',
    bookSuccessMessage: 'Votre rendez-vous d\'orientation est confirmé ! Vous recevrez des rappels par e-mail.',
    humanHandoffHeader: 'Relais Conseiller en Direct',
    humanHandoffConnected: 'Connexion en cours avec un agent humain...',
    advisorWaitTime: 'Attente estimée : < 2 minutes',
    advisorFallbackMsg: 'Laissez un message écrit ou planifiez un appel ci-dessous.',
    whatsAppCTA: 'Continuer sur WhatsApp',
    citationLabel: 'Source :',

    // Billing
    billTitle: 'Portail d\'abonnements & Facturation',
    billSub: 'Gérez votre formule SaaS, visualisez votre consommation et configurez Stripe ou Flutterwave.',
    currentPlan: 'Abonnement Actuel',
    annualDiscount: 'Économisez 20% en optant pour la facturation annuelle',
    StarterName: 'Starter',
    GrowthName: 'Croissance',
    ProName: 'Professionnel',
    AgencyName: 'Agence'
  }
};

interface LanguageContextType {
  activeLanguage: LanguageCode;
  setIsLanguage: (lang: LanguageCode) => void;
  translate: (key: keyof typeof TRANSLATIONS.en, replacements?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeLanguage, setActiveLanguage] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('enrollai_lang_code');
    if (saved === 'en' || saved === 'fr') return saved;
    const browserLang = navigator.language.slice(0, 2);
    return browserLang === 'fr' ? 'fr' : 'en';
  });

  useEffect(() => {
    localStorage.setItem('enrollai_lang_code', activeLanguage);
  }, [activeLanguage]);

  const setIsLanguage = (lang: LanguageCode) => {
    setActiveLanguage(lang);
  };

  const translate = (key: keyof typeof TRANSLATIONS.en, replacements?: Record<string, string>): string => {
    const langDict = TRANSLATIONS[activeLanguage] || TRANSLATIONS.en;
    let label = langDict[key] || TRANSLATIONS.en[key] || String(key);
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        label = label.replace(`{${k}}`, v);
      });
    }
    return label;
  };

  return (
    <LanguageContext.Provider value={{ activeLanguage, setIsLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
export { TRANSLATIONS };
