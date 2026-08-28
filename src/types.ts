export type AgentPersonaId = 'technical' | 'hr' | 'hiring_manager' | 'skeptic';

export interface AgentPersonaConfig {
  id: AgentPersonaId;
  name: string;
  roleTitle: string;
  badge: string;
  avatarColor: string;
  bgLight: string;
  borderColor: string;
  textColor: string;
  accentHex: string;
  voiceName: string;
  voicePitch: number;
  voiceRate: number;
  description: string;
  focusAreas: string[];
}

export type RecommendationType = 
  | 'STRONG_HIRE' 
  | 'HIRE' 
  | 'LEAN_HIRE' 
  | 'LEAN_REJECT' 
  | 'STRONG_REJECT'
  | 'INSUFFICIENT_INFO';

export interface JobDescription {
  id: string;
  title: string;
  department: string;
  level: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  responsibilities: string[];
  teamCultureValues: string[];
  rawText: string;
}

export interface CandidateDossier {
  id: string;
  name: string;
  appliedRole: string;
  resumeText: string;
  transcriptText: string;
  sourceFiles?: {
    resumeFileName?: string;
    transcriptFileName?: string;
  };
}

export interface ExtractedClaim {
  id: string;
  topic: string;
  claimSource: 'resume' | 'transcript';
  claimText: string;
  quote: string;
  verificationStatus: 'VERIFIED' | 'QUESTIONABLE' | 'CONTRADICTED' | 'UNSUBSTANTIATED';
  verificationNotes: string;
}

export interface CandidateProfile {
  candidateId: string;
  candidateName: string;
  summary: string;
  yearsOfExperience: number | string;
  technicalSkills: {
    verified: string[];
    claimedOnly: string[];
  };
  keyProjects: {
    name: string;
    claimedRole: string;
    evidenceFound: string;
    transcriptQuotes: string[];
  }[];
  extractedClaims: ExtractedClaim[];
  potentialRedFlags: string[];
  missingInformation: string[];
  generatedAt: number;
}

export interface EvidenceItem {
  id: string;
  title: string;
  explanation: string;
  quote: string;
  source: 'resume' | 'transcript';
  context?: string;
}

export interface ConcernItem {
  id: string;
  title: string;
  explanation: string;
  quote: string;
  source: 'resume' | 'transcript';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'FATAL';
}

export interface IndependentEvaluation {
  personaId: AgentPersonaId;
  personaName: string;
  recommendation: RecommendationType;
  confidenceScore: number; // 0 - 100
  domainScore: number; // 0 - 100
  reasoningSummary: string;
  keyStrengths: EvidenceItem[];
  criticalConcerns: ConcernItem[];
  directQuotesExamined: {
    quote: string;
    source: 'resume' | 'transcript';
    commentary: string;
  }[];
  unclearOrMissingInfo: string[];
  isolatedLLMTimestamp: number;
  promptTokensEstimate?: number;
}

export type DebateMessageType = 
  | 'CHALLENGE' 
  | 'DEFENSE' 
  | 'CONCESSION' 
  | 'POSITION_SHIFT' 
  | 'CROSS_EXAMINATION'
  | 'SYNTHESIS_REMARK';

export interface PositionShiftRecord {
  fromRecommendation: RecommendationType;
  toRecommendation: RecommendationType;
  fromConfidence: number;
  toConfidence: number;
  triggerPersonaId: AgentPersonaId;
  triggerArgument: string;
  reason: string;
}

export interface DebateMessage {
  id: string;
  roundNumber: number;
  turnIndex: number;
  speakerId: AgentPersonaId;
  speakerName: string;
  targetPersonaId?: AgentPersonaId | 'ALL';
  messageType: DebateMessageType;
  citedQuote?: string;
  content: string;
  didChangeMind: boolean;
  positionShift?: PositionShiftRecord;
  timestamp: number;
}

export interface DebateRound {
  roundNumber: number;
  roundTitle: string;
  focusTheme: string;
  messages: DebateMessage[];
  roundTakeaway: string;
}

export interface UnresolvedDisagreement {
  topic: string;
  personaA: {
    id: AgentPersonaId;
    name: string;
    stance: string;
    supportingQuote: string;
  };
  personaB: {
    id: AgentPersonaId;
    name: string;
    stance: string;
    supportingQuote: string;
  };
  arbiterAssessment: string;
}

export interface FinalDecision {
  candidateId: string;
  candidateName: string;
  finalRecommendation: RecommendationType;
  overallConfidence: number; // 0 - 100
  hiringVerdictTitle: string;
  consensusType: 'UNANIMOUS' | 'STRONG_MAJORITY' | 'SPLIT_DELIBERATION' | 'HIGH_RISK_OVERRIDE';
  
  // Non-simple-average weighted synthesis breakdown
  dimensionScores: {
    technicalRigor: { score: number; weight: number; keyFinding: string };
    culturalFitAndHonesty: { score: number; weight: number; keyFinding: string };
    businessValueROI: { score: number; weight: number; keyFinding: string };
    skepticRiskAssessment: { riskPenalty: number; weight: number; keyFinding: string };
  };
  
  synthesisReasoning: string;
  whyNotSimpleAverage: string; // explicitly explains the weighted logic & agent evidence interactions
  
  conclusiveStrengths: {
    point: string;
    backedByQuote: string;
    source: 'resume' | 'transcript';
  }[];
  
  conclusiveConcerns: {
    risk: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'DEALBREAKER';
    backedByQuote: string;
    suggestedMitigationOrNextAction: string;
  }[];
  
  unresolvedDisagreements: UnresolvedDisagreement[];
  
  interviewFollowUpQuestions: string[];
  finalTimestamp: number;
}

export interface CandidateEvaluationSession {
  candidateId: string;
  status: 'IDLE' | 'BUILDING_PROFILE' | 'RUNNING_AGENTS' | 'DEBATING' | 'DECIDING' | 'COMPLETED' | 'ERROR';
  profile?: CandidateProfile;
  independentEvaluations?: Partial<Record<AgentPersonaId, IndependentEvaluation>>;
  debateRounds?: DebateRound[];
  finalDecision?: FinalDecision;
  errorMessage?: string;
  executionLogs: {
    timestamp: number;
    step: string;
    detail: string;
    isError?: boolean;
  }[];
}

export interface HeadToHeadCategory {
  category: string;
  candidateAScore: number; // 0-100
  candidateBScore: number; // 0-100
  analysis: string;
  decisiveQuoteA?: string;
  decisiveQuoteB?: string;
  winnerCandidateId: 'candidate_a' | 'candidate_b' | 'TIE';
}

export interface ComparisonReport {
  timestamp: number;
  winnerCandidateId: string;
  winnerCandidateName: string;
  executiveSummary: string;
  categories: HeadToHeadCategory[];
  hiringRecommendationMatrix: {
    ifPriorityIsVelocity: string;
    ifPriorityIsCultureAndRigor: string;
    ifBudgetIsConstrained: string;
  };
  panelConsensusTakeaway: string;
}
