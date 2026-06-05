export type Role = 'OWNER' | 'ADMIN' | 'ADVISOR' | 'AGENT';

export interface ThemeToken {
  bg_primary: string;
  bg_secondary: string;
  bg_card: string;
  border: string;
  text_primary: string;
  text_secondary: string;
  accent: string;
  accent_hover: string;
  accent_gradient: string;
  accent_shadow: string;
  badge_bg: string;
  badge_text: string;
  nav_active_bg: string;
  nav_active_text: string;
  success: string;
  warning: string;
  danger: string;
  launcher_gradient: string;
}

export type ThemeId = 'slate_coral' | 'midnight' | 'aurora' | 'forest' | 'carbon' | 'sunset' | 'ocean' | 'neon_cosmos' | 'coral_spark';

export interface AppTheme {
  id: ThemeId;
  label: string;
  mode: 'light' | 'dark' | 'gradient';
  tokens: ThemeToken;
}

export interface VisitorGeo {
  country: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  timezone: string;
  language: string;
  device: 'Mobile' | 'Desktop' | 'Tablet';
  browser: 'Chrome' | 'Firefox' | 'Safari' | 'Edge';
  os: 'Windows' | 'macOS' | 'Android' | 'iOS' | 'Linux';
  referrer: string;
  page_visited: string;
  time_on_page_before_chat: number;
  ip_address: string;
}

export interface Lead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  programInterest: string;
  status: 'HOT' | 'WARM' | 'COLD' | 'CONTACTED' | 'CONVERTED';
  score: number;
  source: string;
  createdAt: string;
  lastContactedAt: string;
  geo?: VisitorGeo;
}

export interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'AGENT';
  content: string;
  confidence?: number; // 0-100
  citationSource?: string;
  createdAt: string;
  fileAttachment?: {
    name: string;
    size: string;
    type: string;
  };
}

export interface Conversation {
  id: string;
  leadId?: string;
  sessionId: string;
  status: 'ACTIVE' | 'CLOSED' | 'ESCALATED';
  startedAt: string;
  endedAt?: string;
  messages: Message[];
  sentiment: 'positive' | 'neutral' | 'frustrated' | 'urgent';
  unreadCount?: number;
}

export interface Program {
  id: string;
  name: string;
  department: string;
  duration: string;
  fees: string;
  capacityBadge: string;
  rating: number;
  description: string;
}

export interface KnowledgeDocument {
  id: string;
  fileName: string;
  fileSize: string;
  status: 'PROCESSING' | 'READY' | 'ERROR';
  chunkCount: number;
  uploadedAt: string;
}

export interface Appointment {
  id: string;
  leadName: string;
  program: string;
  date: string;
  time: string;
  timezone: string;
  type: 'VIDEO' | 'PHONE' | 'CAMPUS';
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  createdAt: string;
}

export interface WidgetConfig {
  botName: string;
  welcomeMessage: string;
  primaryColor: string;
  theme: ThemeId;
  language: 'en' | 'fr';
  leadCaptureEnabled: boolean;
  bookingEnabled: boolean;
  humanHandoffEnabled: boolean;
  confidenceDisplayEnabled: boolean;
  whatsappEnabled: boolean;
  whatsappNumber: string;
  
  // Triggers
  timeTriggerEnabled: boolean;
  timeTriggerDelay: number; // seconds
  scrollTriggerEnabled: boolean;
  scrollTriggerPercent: number;
  exitIntentEnabled: boolean;
  idleTriggerEnabled: boolean;
}
