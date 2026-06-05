import { Lead, Conversation, Program, KnowledgeDocument, Appointment, VisitorGeo } from '../types';

export const MOCK_PROGRAMS: Program[] = [
  {
    id: 'prog-1',
    name: 'Executive MBA (EN/FR)',
    department: 'Business & Management',
    duration: '18 Months',
    fees: '$24,500 / Year',
    capacityBadge: 'Limited seats (8 left)',
    rating: 4.8,
    description: 'A cohort-driven executive program tailored for leadership candidates, covering strategic management, analytical decision systems, and global investment.'
  },
  {
    id: 'prog-2',
    name: 'B.Sc. Software Engineering with Applied AI',
    department: 'Computer Science',
    duration: '4 Years',
    fees: '$12,800 / Year',
    capacityBadge: 'Filling fast',
    rating: 4.9,
    description: 'Core software design integrated with predictive modeling, neural networking, modern cloud deployments, and direct RAG conversational models.'
  },
  {
    id: 'prog-3',
    name: 'Master in Global Public Health',
    department: 'Health Sciences',
    duration: '2 Years',
    fees: '$15,400 / Year',
    capacityBadge: 'Available',
    rating: 4.6,
    description: 'Empowers students to orchestrate community healthcare initiatives, epidemiological models, and crisis resolution strategies.'
  },
  {
    id: 'prog-4',
    name: 'Diploma in Hospitality & Tourism Excellence',
    department: 'Advisory & Humanities',
    duration: '1 Year',
    fees: '$9,200 / Year',
    capacityBadge: 'High demand',
    rating: 4.5,
    description: 'Accelerated professional diploma emphasizing luxury service metrics, destination management, and digital marketing for international hotels.'
  }
];

export const MOCK_DOCUMENT_LIST: KnowledgeDocument[] = [
  {
    id: 'doc-1',
    fileName: 'Horizon_University_Tuition_Brochure_2026.pdf',
    fileSize: '4.2 MB',
    status: 'READY',
    chunkCount: 124,
    uploadedAt: '2026-04-12'
  },
  {
    id: 'doc-2',
    fileName: 'Core_Enrollment_Guidelines_ENG_FR.docx',
    fileSize: '1.8 MB',
    status: 'READY',
    chunkCount: 68,
    uploadedAt: '2026-05-18'
  },
  {
    id: 'doc-3',
    fileName: 'International_Scholarship_Matrix_2026.csv',
    fileSize: '650 KB',
    status: 'READY',
    chunkCount: 32,
    uploadedAt: '2026-05-30'
  }
];

export const SAMPLE_FAQS = [
  {
    id: 'faq-1',
    question: 'What is the absolute deadline for Fall 2026 admissions?',
    answer: 'The application deadline for Fall 2026 is July 15, 2026 for domestic applicants and June 1, 2026 for international applicants requiring visa processing.'
  },
  {
    id: 'faq-2',
    question: 'Are scholarship support allocations available for Cameroon/African students?',
    answer: 'Yes! Horizon University supports talented sub-Saharan African applicants with the Merit Excellence Scholarship which covers up to 45% of standard tuition. No separate application is required; it is auto-rated on registration GPA.'
  },
  {
    id: 'faq-3',
    question: 'What documents are required for transcript verification?',
    answer: 'You must attach a validated bachelor transcript/diploma, certificate of English / French fluency or pass our inner test, scan of your passport page, and 1 recommendation reference.'
  }
];

export const MOCK_GEOS: VisitorGeo[] = [
  {
    country: 'Cameroon',
    city: 'Yaoundé',
    region: 'Centre',
    latitude: 3.848,
    longitude: 11.502,
    timezone: 'Africa/Douala',
    language: 'fr-CM',
    device: 'Mobile',
    browser: 'Chrome',
    os: 'Android',
    referrer: 'facebook.com',
    page_visited: '/programs/mba',
    time_on_page_before_chat: 18,
    ip_address: '105.235.12.xxx'
  },
  {
    country: 'Cameroon',
    city: 'Douala',
    region: 'Littoral',
    latitude: 4.051,
    longitude: 9.767,
    timezone: 'Africa/Douala',
    language: 'en-CM',
    device: 'Mobile',
    browser: 'Firefox',
    os: 'iOS',
    referrer: 'google.com',
    page_visited: '/apply',
    time_on_page_before_chat: 24,
    ip_address: '105.235.45.xxx'
  },
  {
    country: 'Nigeria',
    city: 'Lagos',
    region: 'Lagos State',
    latitude: 6.524,
    longitude: 3.379,
    timezone: 'Africa/Lagos',
    language: 'en-NG',
    device: 'Desktop',
    browser: 'Chrome',
    os: 'Windows',
    referrer: 'direct',
    page_visited: '/fees',
    time_on_page_before_chat: 12,
    ip_address: '197.89.201.xxx'
  },
  {
    country: 'Canada',
    city: 'Montréal',
    region: 'Quebec',
    latitude: 45.501,
    longitude: -73.567,
    timezone: 'America/Montreal',
    language: 'fr-CA',
    device: 'Desktop',
    browser: 'Safari',
    os: 'macOS',
    referrer: 'linkedin.com',
    page_visited: '/programs/software-engineering',
    time_on_page_before_chat: 32,
    ip_address: '142.250.74.xxx'
  },
  {
    country: 'France',
    city: 'Paris',
    region: 'Île-de-France',
    latitude: 48.856,
    longitude: 2.352,
    timezone: 'Europe/Paris',
    language: 'fr-FR',
    device: 'Desktop',
    browser: 'Safari',
    os: 'macOS',
    referrer: 'google.com',
    page_visited: '/programs/mba',
    time_on_page_before_chat: 40,
    ip_address: '82.64.12.xxx'
  },
  {
    country: 'India',
    city: 'Mumbai',
    region: 'Maharashtra',
    latitude: 19.076,
    longitude: 72.877,
    timezone: 'Asia/Kolkata',
    language: 'en-IN',
    device: 'Mobile',
    browser: 'Chrome',
    os: 'Android',
    referrer: 'instagram.com',
    page_visited: '/contact',
    time_on_page_before_chat: 8,
    ip_address: '49.32.180.xxx'
  }
];

export const INITIAL_MOCK_LEADS: Lead[] = [
  {
    id: 'lead-1',
    fullName: 'Lucas Tchinda',
    email: 'lucas.tchinda@gmail.com',
    phone: '+237 677 89 23 11',
    country: 'Cameroon',
    city: 'Yaoundé',
    programInterest: 'Executive MBA (EN/FR)',
    status: 'HOT',
    score: 94,
    source: 'Facebook Ad',
    createdAt: '2026-06-04T18:23:40Z',
    lastContactedAt: '2026-06-05T09:12:00Z',
    geo: MOCK_GEOS[0]
  },
  {
    id: 'lead-2',
    fullName: 'Chioma Ndubuisí',
    email: 'chioma.ndu@yahoo.com',
    phone: '+234 803 112 3456',
    country: 'Nigeria',
    city: 'Lagos',
    programInterest: 'B.Sc. Software Engineering with Applied AI',
    status: 'CONVERTED',
    score: 100,
    source: 'Google Search',
    createdAt: '2026-06-02T10:11:15Z',
    lastContactedAt: '2026-06-04T14:30:00Z',
    geo: MOCK_GEOS[2]
  },
  {
    id: 'lead-3',
    fullName: 'Geneveive Levesque',
    email: 'g.levesque@unival.ca',
    phone: '+1 514 670 1234',
    country: 'Canada',
    city: 'Montréal',
    programInterest: 'Master in Global Public Health',
    status: 'WARM',
    score: 78,
    source: 'LinkedIn Referral',
    createdAt: '2026-06-03T21:40:02Z',
    lastContactedAt: '2026-06-04T10:00:00Z',
    geo: MOCK_GEOS[3]
  },
  {
    id: 'lead-4',
    fullName: 'Idris El Amrani',
    email: 'idris_amrani@outlook.com',
    phone: '+212 661 234567',
    country: 'Morocco',
    city: 'Rabat',
    programInterest: 'Executive MBA (EN/FR)',
    status: 'CONTACTED',
    score: 84,
    source: 'Direct Site visit',
    createdAt: '2026-06-01T08:15:30Z',
    lastContactedAt: '2026-06-02T13:10:00Z',
    geo: MOCK_GEOS[4]
  },
  {
    id: 'lead-5',
    fullName: 'Hervé Bakandock',
    email: 'b.herve@ndog.cm',
    phone: '+237 699 12 78 45',
    country: 'Cameroon',
    city: 'Douala',
    programInterest: 'B.Sc. Software Engineering with Applied AI',
    status: 'COLD',
    score: 45,
    source: 'Direct Site visit',
    createdAt: '2026-05-28T14:10:00Z',
    lastContactedAt: '2026-05-29T11:00:00Z',
    geo: MOCK_GEOS[1]
  }
];

export const INITIAL_MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    leadId: 'lead-1',
    sessionId: 'session_tchinda_99',
    status: 'ESCALATED',
    sentiment: 'urgent',
    unreadCount: 1,
    startedAt: '2026-06-04T18:20:00Z',
    messages: [
      {
        id: 'msg-1',
        role: 'USER',
        content: 'Hi! I am Lucas from Yaoundé. Do you support payment installments for the EMBA program?',
        createdAt: '2026-06-04T18:20:10Z'
      },
      {
        id: 'msg-2',
        role: 'ASSISTANT',
        content: 'Yes, Lucas! Horizon University offers split payment schedules. The initial deposit is 40% upon reception, and the remaining 60% can be split in 3 installment deadlines over the first year.',
        confidence: 96,
        citationSource: 'Core_Enrollment_Guidelines_ENG_FR.docx',
        createdAt: '2026-06-04T18:20:45Z'
      },
      {
        id: 'msg-3',
        role: 'USER',
        content: 'Superb. Can I get a partial scholarship? My average was 16/20 on my engineering diploma.',
        createdAt: '2026-06-04T18:21:50Z'
      },
      {
        id: 'msg-4',
        role: 'ASSISTANT',
        content: 'Excellent academic results! An average of 16/20 qualifies you for our Merit Excellence Scholarship, covering 30% to 45% of your global tuition fees. Let me connect you directly to our lead Human Advisor to reserve this spot.',
        confidence: 91,
        citationSource: 'International_Scholarship_Matrix_2026.csv',
        createdAt: '2026-06-04T18:22:30Z'
      },
      {
        id: 'msg-5',
        role: 'USER',
        content: 'Yes please, I want to talk to an advisor, connect me now!',
        createdAt: '2026-06-04T18:23:40Z'
      }
    ]
  },
  {
    id: 'conv-2',
    leadId: 'lead-3',
    sessionId: 'session_genevieve_77',
    status: 'ACTIVE',
    sentiment: 'positive',
    unreadCount: 0,
    startedAt: '2026-06-03T21:35:00Z',
    messages: [
      {
        id: 'msg-6',
        role: 'USER',
        content: 'Are health clinics open for internships in your Global Public Health masters?',
        createdAt: '2026-06-03T21:35:10Z'
      },
      {
        id: 'msg-7',
        role: 'ASSISTANT',
        content: 'Absolutely. Graduates are positioned directly in partner clinical centers in Montréal, Dakar, and Geneva during the final 6 months of internship.',
        confidence: 88,
        citationSource: 'Horizon_University_Tuition_Brochure_2026.pdf',
        createdAt: '2026-06-03T21:36:00Z'
      }
    ]
  },
  {
    id: 'conv-3',
    leadId: 'lead-5',
    sessionId: 'session_herve_11',
    status: 'CLOSED',
    sentiment: 'neutral',
    unreadCount: 0,
    startedAt: '2026-05-28T14:05:00Z',
    messages: [
      {
        id: 'msg-8',
        role: 'USER',
        content: 'Bonsoir, y a-t-il des cours en soirée d\'informatique ?',
        createdAt: '2026-05-28T14:05:10Z'
      },
      {
        id: 'msg-9',
        role: 'ASSISTANT',
        content: 'Bonsoir! Oui, le B.Sc. Software Engineering propose un parcours accéléré cours du soir (17h30 à 21h00) pour professionnels en activité. Vous pouvez valider vos modules à votre propre rythme.',
        confidence: 94,
        citationSource: 'Core_Enrollment_Guidelines_ENG_FR.docx',
        createdAt: '2026-05-28T14:06:05Z'
      }
    ]
  }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'app-1',
    leadName: 'Lucas Tchinda',
    program: 'Executive MBA (EN/FR)',
    date: '2026-06-10',
    time: '14:30',
    timezone: 'Africa/Douala',
    type: 'VIDEO',
    status: 'CONFIRMED',
    createdAt: '2026-06-04'
  },
  {
    id: 'app-2',
    leadName: 'Chioma Ndubuisí',
    program: 'B.Sc. Software Engineering with Applied AI',
    date: '2026-06-12',
    time: '11:00',
    timezone: 'Africa/Lagos',
    type: 'PHONE',
    status: 'CONFIRMED',
    createdAt: '2026-06-03'
  },
  {
    id: 'app-3',
    leadName: 'Geneveive Levesque',
    program: 'Master in Global Public Health',
    date: '2026-06-15',
    time: '09:00',
    timezone: 'America/Montreal',
    type: 'CAMPUS',
    status: 'PENDING',
    createdAt: '2026-06-04'
  }
];

export const CANNED_RESPONSES = [
  "Thank you for your interest! I'd love to tell you more about our programs.",
  "Let me check the latest fee structure and get back to you in a moment.",
  "Great news — you qualify for our sub-Saharan Merit Excellence Scholarship!",
  "I have set up/confirmed an appointment with your advisor. Check your email for links."
];

// Funnel values requested
export const FUNNEL_DATA = [
  { value: 12840, label: 'Widget Impressions', percentage: 100 },
  { value: 4210, label: 'Widget Opened', percentage: 32.7 },
  { value: 2890, label: 'Message Sent', percentage: 22.5 },
  { value: 1240, label: 'Lead Captured', percentage: 9.6 },
  { value: 387, label: 'Appointment Booked', percentage: 3.0 },
  { value: 94, label: 'Enrollment Completed', percentage: 0.73 }
];
