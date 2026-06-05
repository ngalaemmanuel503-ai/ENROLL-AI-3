export type IndustryVertical =
  | 'education'
  | 'law_firm'
  | 'medical'
  | 'real_estate'
  | 'immigration'
  | 'recruitment'
  | 'finance'
  | 'ecommerce'
  | 'saas'
  | 'other';

export interface VerticalTemplate {
  id: IndustryVertical;
  label: string;
  defaultBotName: string;
  defaultWelcomeMessage: string;
  serviceLabel: string; // E.g., 'Program Interest', 'Legal Matter'
  termOverrides: {
    serviceSingular: string; // E.g., 'Program', 'Case Type', 'Listing'
    servicePlural: string;   // E.g., 'Programs', 'Case Types', 'Listings'
    advisorSingular: string; // E.g., 'Admissions Advisor', 'Legal Intake Agent'
  };
  defaultFaqs: Array<{ question: string; answer: string }>;
  promptPersona: string;
}

export const VERTICAL_TEMPLATES: Record<IndustryVertical, VerticalTemplate> = {
  education: {
    id: 'education',
    label: 'Education',
    defaultBotName: 'Horizon Admissions Bot',
    defaultWelcomeMessage: 'Hello! Welcome to Horizon University! How can I help you find the right program today? 🎓',
    serviceLabel: 'Program Interest',
    termOverrides: {
      serviceSingular: 'Program',
      servicePlural: 'Programs',
      advisorSingular: 'Admissions Advisor'
    },
    defaultFaqs: [
      {
        question: 'What is the absolute deadline for Fall Admissions?',
        answer: 'The application deadline for Fall intake is July 15 for academic vetting, and June 1 for international students needing visa processing.'
      },
      {
        question: 'Are scholarship support allocations available?',
        answer: 'Yes! We support candidates with the Merit Excellence Scholarship covering up to 45% of standard tuition based on a GPA of 14/20 or above.'
      },
      {
        question: 'What documents are required for transcript verification?',
        answer: 'You must provide a scanned bachelor transcript, proof of English/French literacy, passport scans, and 2 academic recommendations.'
      }
    ],
    promptPersona: 'You are a helpful admissions and enrollment advisor at {firm_name}. Answer questions about academic requirements, scholarships, deadlines, and direct students to book an interview.'
  },
  law_firm: {
    id: 'law_firm',
    label: 'Law Firm',
    defaultBotName: 'Lexi Lex Advisor',
    defaultWelcomeMessage: 'Welcome to our Legal Intake Portal. Tell us about your situation, and we can match you to a legal expert. ⚖️',
    serviceLabel: 'Legal Matter Type',
    termOverrides: {
      serviceSingular: 'Case Type',
      servicePlural: 'Case Types',
      advisorSingular: 'Legal Counsel'
    },
    defaultFaqs: [
      {
        question: 'How does your billing work?',
        answer: 'We provide clear flat-fee billing for standard contracts and consultations, and competitive sliding-scale hourly rates for trial representation.'
      },
      {
        question: 'How do I schedule a full case evaluation?',
        answer: 'You can select a convenient slot in our Appointments panel to book a 30-minute introductory case assessment with an intake lawyer.'
      },
      {
        question: 'Which legal disciplines does your firm cover?',
        answer: 'We focus heavily on corporate governance, family law, human rights immigration filings, and general civil litigation.'
      }
    ],
    promptPersona: 'You are an empathetic, professional legal intake specialist at {firm_name}. Ask clarifying questions about their legal concern (corporate, family, litigation, civil) to understand the issue, without giving formal binding legal opinions. Encourage booking an initial consultation.'
  },
  medical: {
    id: 'medical',
    label: 'Medical / Clinic',
    defaultBotName: 'AcuMed Care Triage',
    defaultWelcomeMessage: 'Welcome to our clinic. What symptoms or specialties are you looking for today? Please note this is not for emergency care. 🩺',
    serviceLabel: 'Reason for Visit',
    termOverrides: {
      serviceSingular: 'Clinic Specialty',
      servicePlural: 'Clinics / Specialties',
      advisorSingular: 'Medical Advisor'
    },
    defaultFaqs: [
      {
        question: 'Do you accept international health insurance?',
        answer: 'Yes, we accept standard health coverage networks. Please provide your electronic insurance card during check-in.'
      },
      {
        question: 'How do I request prescription refills?',
        answer: 'Refills are processed instantly within 24 hours. Submit a request in our main intake portal or call the front-desk.'
      },
      {
        question: 'Are free parking facilities available?',
        answer: 'Yes, free guest parking is available at the rear parking deck of our medical facility.'
      }
    ],
    promptPersona: 'You are a precise, comforting healthcare triage desk coordinator at {firm_name}. Help users identify medical specialties or consult parameters, and note that for urgent emergencies they must call local emergency dispatch immediately.'
  },
  real_estate: {
    id: 'real_estate',
    label: 'Real Estate',
    defaultBotName: 'Haven Prop Scout',
    defaultWelcomeMessage: 'Hello! Searching for a new home or listing budget? I can guide you to active listings and showings! 🏠',
    serviceLabel: 'Property Budget & Area',
    termOverrides: {
      serviceSingular: 'Listing Type',
      servicePlural: 'Listings',
      advisorSingular: 'Property Agent'
    },
    defaultFaqs: [
      {
        question: 'What is your seller representation commission rate?',
        answer: 'We charge a standard 3% brokerage commission fee for exclusive seller representational agreements, providing premium property showcasing.'
      },
      {
        question: 'Can we schedule a private home showing?',
        answer: 'Certainly! View our calendar slots under the booking section and reserve a live property showing within 24 hours.'
      },
      {
        question: 'Do you manage rental agreements?',
        answer: 'Yes, we have a portfolio of premium long-term residential and corporate leases matching all budget classes.'
      }
    ],
    promptPersona: 'You are a charming, proactive property scheduling scout at {firm_name}. Help clients define their real estate budget, desired neighborhood, and listing type (Buy/Rent), then prompt them to book a tour with a listing agent.'
  },
  immigration: {
    id: 'immigration',
    label: 'Immigration Consultancy',
    defaultBotName: 'MigraPath Navigator',
    defaultWelcomeMessage: 'Hello! Relocating or applying for an international study/work permit? Ask us anything about immigration streams! ✈️',
    serviceLabel: 'Immigration / Visa Stream',
    termOverrides: {
      serviceSingular: 'Visa Pathway',
      servicePlural: 'Visa Pathways',
      advisorSingular: 'Immigration Consultant'
    },
    defaultFaqs: [
      {
        question: 'How long does Express Entry skilled worker processing take?',
        answer: 'Federal skilled worker streams typically require between 6 to 9 months for full validation upon profile registration.'
      },
      {
        question: 'What is your visa approval success rating?',
        answer: 'Our immigration legal advisory has maintained a 96.4% study and work visa approval score across European and North American consular requests.'
      },
      {
        question: 'What credentials must be pre-verified?',
        answer: 'A validated WES credential assessment for high-school/college degrees and official language test sheets (IELTS or TEF) are required.'
      }
    ],
    promptPersona: 'You are an authority-backed immigration advisor assistant at {firm_name}. Guide candidates on visas, study permits, corporate relocations, and points-based immigration calculations. Emphasize that a full assessment requires booking a session.'
  },
  recruitment: {
    id: 'recruitment',
    label: 'Recruitment Agency',
    defaultBotName: 'Apex Talent Scout',
    defaultWelcomeMessage: 'Hi! Looking for a new role or sourcing elite hires? Let connect you to elite career paths! 💼',
    serviceLabel: 'Desired Job Sector',
    termOverrides: {
      serviceSingular: 'Job Option',
      servicePlural: 'Job Options',
      advisorSingular: 'Recruiter'
    },
    defaultFaqs: [
      {
        question: 'Are matching fees charged to job seekers?',
        answer: 'Absolutely not! Our executive scouting and talent placement services are 100% free of charge for candidates.'
      },
      {
        question: 'What sectors do your placement operations cover?',
        answer: 'We focus heavily on technical software engineering, technical product roles, finance analysts, and corporate management positions.'
      },
      {
        question: 'How fast can I land an initial recruiter screen?',
        answer: 'We triage submitted resumes against active client profiles and typically coordinate screening schedules in 48 hours.'
      }
    ],
    promptPersona: 'You are a sharp, communicative recruiting scouter at {firm_name}. Screen applicants for their programming languages, years of experience, or leadership styles, and book a review call with our head recruiters.'
  },
  finance: {
    id: 'finance',
    label: 'Financial Advisory',
    defaultBotName: 'Equis Wealth Copilot',
    defaultWelcomeMessage: 'Hello. Let us discuss your wealth, tax strategy, and retirement planning. How can we advice you today? 📈',
    serviceLabel: 'Financial Objective',
    termOverrides: {
      serviceSingular: 'Advisory Plan',
      servicePlural: 'Advisory Plans',
      advisorSingular: 'Wealth Advisor'
    },
    defaultFaqs: [
      {
        question: 'What is your minimum capital entry threshold?',
        answer: 'Our comprehensive wealth advisory plans operate with a starting investable capital threshold of typical $100,000.'
      },
      {
        question: 'Do you operate under a fiduciary duty?',
        answer: 'Yes! Our advisors operate as legally bound fiduciaries. We do not accept sales kickbacks or commission markups on products.'
      },
      {
        question: 'What annual asset management fee applies?',
        answer: 'We charge an institutional Assets Under Management (AUM) fee scale of 0.75% to 1.25%, with clear quarterly reporting.'
      }
    ],
    promptPersona: 'You are a highly professional, compliant wealth advisor coordinator at {firm_name}. Help clients specify goals (tax, pension, business expansion, inheritance) and book a meeting. Avoid making specific stock or crypto buy alerts.'
  },
  ecommerce: {
    id: 'ecommerce',
    label: 'E-commerce',
    defaultBotName: 'CartSupport AI',
    defaultWelcomeMessage: 'Hi there! Looking for your package or need product suggestions? Ask away! 🛒',
    serviceLabel: 'Product Interest Group',
    termOverrides: {
      serviceSingular: 'Product Line',
      servicePlural: 'Product Lines',
      advisorSingular: 'Shopping Assistant'
    },
    defaultFaqs: [
      {
        question: 'What is your global refund and return policy?',
        answer: 'We accept uncompromised product returns inside 30 days of standard tracking delivery for a 100% money-back guarantee.'
      },
      {
        question: 'Is international tracking support active?',
        answer: 'Yes! Once shipped, a tracking link is emailed instantly to consult exact delivery schedules in your browser.'
      },
      {
        question: 'What is the threshold for free parcel shipping?',
        answer: 'We provide expedited free shipping to all geographic continental regions for cart checkouts exceeding $75.'
      }
    ],
    promptPersona: 'You are a warm, customer-centric retail assistant at {firm_name}. Answer questions about shipping, sizing, order status, and make friendly product suggestions based on user queries.'
  },
  saas: {
    id: 'saas',
    label: 'SaaS / Tech',
    defaultBotName: 'PulseTech Support',
    defaultWelcomeMessage: 'Hi! Let me help you with API logs, self-hosted configurations, or product quotas. 🚀',
    serviceLabel: 'Feature Integration Focus',
    termOverrides: {
      serviceSingular: 'Software Tier',
      servicePlural: 'Software Tiers',
      advisorSingular: 'Product Engineer'
    },
    defaultFaqs: [
      {
        question: 'Do you offer self-hosted on-premise deployments?',
        answer: 'Yes! Our Enterprise license supports isolated on-premise Kubernetes helm deployments with dedicated custom security certificates.'
      },
      {
        question: 'What API throttle constraints apply to standard developer keys?',
        answer: 'Developer keys permit up to 60 calls per minute, while enterprise tier structures run with a dedicated parallel limit of 500/min.'
      },
      {
        question: 'Is a credit card required to start a software test trial?',
        answer: 'No, our 14-day comprehensive trial is fully featured and does not request any credit details to begin evaluating.'
      }
    ],
    promptPersona: 'You are a logical, skilled system support engineer at {firm_name}. Answer technical questions regarding webhooks, SOC2 security audits, database connectors, and cloud integrations.'
  },
  other: {
    id: 'other',
    label: 'Other',
    defaultBotName: 'IntelliBot Advisor',
    defaultWelcomeMessage: 'Welcome! How can we assist you with our services today? 🌐',
    serviceLabel: 'Consultation Category',
    termOverrides: {
      serviceSingular: 'Service Type',
      servicePlural: 'Service Types',
      advisorSingular: 'Service Consultant'
    },
    defaultFaqs: [
      {
        question: 'What office and contact schedules apply?',
        answer: 'Our professional headquarters operate Monday through Friday from 9:00 AM to 6:00 PM.'
      },
      {
        question: 'Where can we verify operational certifications?',
        answer: 'Our regulatory filings and professional compliance document indexes are listed under the public registry tab.'
      },
      {
        question: 'Can we request a fast customized trial consultation?',
        answer: 'Yes, just fill in your contact information in our widget booking form to connect to our head consultant.'
      }
    ],
    promptPersona: 'You are an all-round helpful intake assistant at {firm_name}. Help users understand services, structure their inquiries, and secure a quick calendar slot to address their goals.'
  }
};
