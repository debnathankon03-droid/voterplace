// ============================================================
// Matdaan Mitra — Core Type Definitions
// ============================================================

/** Voter registration status */
export type VoterStatus = 'under_18' | 'eligible_unregistered' | 'registered' | 'unknown';

/** Election Commission phases */
export type ElectionPhase =
  | 'no_election'
  | 'announced'
  | 'nomination'
  | 'campaigning'
  | 'silence_period'
  | 'polling_day'
  | 'counting'
  | 'concluded';

/** Supported UI languages */
export type SupportedLanguage = 'en' | 'hi' | 'bn';

/** User profile stored in Firestore */
export interface UserProfile {
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  age: number;
  state: string;
  constituency?: string;
  pincode?: string;
  voterStatus: VoterStatus;
  preferredLanguage: SupportedLanguage;
  accessibilityNeeds?: {
    tts: boolean;
    highContrast: boolean;
  };
  onboardingComplete: boolean;
  createdAt: number; // Unix timestamp
  updatedAt: number;
}

/** Quiz result saved per session */
export interface QuizResult {
  id: string;
  uid: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  score: number;
  total: number;
  topics: string[];
  takenAt: number;
}

/** Single quiz question from Gemini */
export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/** Chat message */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  timestamp: number;
}

/** Action card produced by the Decision Engine */
export interface ActionCard {
  id: string;
  priority: number;
  title: string;
  description: string;
  cta: {
    label: string;
    href: string;
    type: 'internal' | 'external' | 'calendar';
  };
  icon: string;
  phase?: ElectionPhase;
}

/** Knowledge Base chunk for RAG */
export interface KBChunk {
  topic: string;
  heading: string;
  content: string;
  tags: string[];
  source?: string;
}

/** Myth vs Fact entry */
export interface MythFact {
  id: string;
  myth: string;
  fact: string;
  source: string;
  category: string;
}

/** Timeline step for the dashboard */
export interface TimelineStep {
  phase: ElectionPhase;
  label: string;
  description: string;
  icon: string;
}

/** Indian states list */
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
] as const;
