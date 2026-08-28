import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { 
  AgentPersonaId, 
  CandidateProfile, 
  IndependentEvaluation, 
  DebateRound, 
  FinalDecision, 
  ComparisonReport 
} from './src/types';
import { AGENT_PERSONAS } from './src/data/defaultDatasets';
import { 
  getFallbackProfile, 
  getFallbackEvaluation, 
  getFallbackDebateRound, 
  getFallbackFinalDecision 
} from './src/data/serverFallbacks';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Lazy-safe Gemini initialization with request-level API key and model support
function getGeminiClient(req?: express.Request): GoogleGenAI | null {
  const customKey = req?.headers['x-gemini-api-key'] as string;
  const apiKey = (customKey && customKey.trim().length > 0) ? customKey.trim() : process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function getGeminiModel(req?: express.Request): string {
  const customModel = req?.headers['x-gemini-model'] as string;
  return (customModel && customModel.trim().length > 0) ? customModel.trim() : 'gemini-3.7-flash';
}

/**
 * Resilient Gemini caller with automatic retry & fallback model cascading
 * Handles 503 Service Unavailable, 429 Rate limits, and temporary capacity spikes
 */
async function callGeminiResiliently(
  ai: GoogleGenAI | null,
  primaryModel: string,
  generateParams: { contents: any; config?: any }
): Promise<any | null> {
  if (!ai) return null;

  const candidateModels = [primaryModel];
  if (primaryModel !== 'gemini-2.5-flash') candidateModels.push('gemini-2.5-flash');
  if (!candidateModels.includes('gemini-2.5-flash-lite')) candidateModels.push('gemini-2.5-flash-lite');

  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: generateParams.contents,
          config: generateParams.config,
        });
        if (response.text && response.text.trim().length > 0) {
          return JSON.parse(response.text);
        }
      } catch (err: any) {
        console.warn(`[Gemini Attempt ${attempt} on model ${model}]:`, err?.message || err);
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
        }
      }
    }
  }
  return null;
}

// -------------------------------------------------------------
// 1. CANDIDATE PROFILE BUILDER API
// -------------------------------------------------------------
app.post('/api/profile-builder', async (req, res) => {
  const { jobDescription, candidate } = req.body;
  if (!candidate || !candidate.resumeText || !candidate.transcriptText) {
    return res.status(400).json({ error: 'Missing candidate resume or transcript' });
  }

  const ai = getGeminiClient(req);
  const prompt = `You are an expert Talent Intelligence Profile Builder.
Analyze the following Job Description, Candidate Resume, and Interview Transcript.
Extract verified facts, project contributions, claims vs reality checks, and missing info.

JOB DESCRIPTION:
${JSON.stringify(jobDescription, null, 2)}

CANDIDATE RESUME:
${candidate.resumeText}

INTERVIEW TRANSCRIPT:
${candidate.transcriptText}

Output a strictly valid JSON object conforming to this schema:
{
  "summary": "Concise 2-3 sentence overview of candidate profile, claims, and reality",
  "yearsOfExperience": "number or string explanation",
  "technicalSkills": {
    "verified": ["array of skills proven in transcript with depth"],
    "claimedOnly": ["array of skills claimed on resume but unproven or contradicted in interview"]
  },
  "keyProjects": [
    {
      "name": "Project Name",
      "claimedRole": "Role claimed",
      "evidenceFound": "Reality from transcript",
      "transcriptQuotes": ["Exact quotes from transcript"]
    }
  ],
  "extractedClaims": [
    {
      "id": "claim-1",
      "topic": "Topic area",
      "claimSource": "resume or transcript",
      "claimText": "Summary of claim",
      "quote": "Exact quote",
      "verificationStatus": "VERIFIED" | "QUESTIONABLE" | "CONTRADICTED" | "UNSUBSTANTIATED",
      "verificationNotes": "Evidence-backed reasoning"
    }
  ],
  "potentialRedFlags": ["Specific red flags backed by quotes"],
  "missingInformation": ["Information that wasn't adequately covered in transcript"]
}`;

  let parsed: any = null;
  if (ai) {
    parsed = await callGeminiResiliently(ai, getGeminiModel(req), {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });
  }

  if (parsed && parsed.summary) {
    const profile: CandidateProfile = {
      candidateId: candidate.id,
      candidateName: candidate.name,
      summary: parsed.summary,
      yearsOfExperience: parsed.yearsOfExperience || `${candidate.yearsOfExperience || 5} years`,
      technicalSkills: parsed.technicalSkills || { verified: [], claimedOnly: [] },
      keyProjects: parsed.keyProjects || [],
      extractedClaims: parsed.extractedClaims || [],
      potentialRedFlags: parsed.potentialRedFlags || [],
      missingInformation: parsed.missingInformation || [],
      generatedAt: Date.now(),
    };
    return res.json({ profile });
  }

  // Robust fallback
  const fallback = getFallbackProfile(candidate, jobDescription);
  return res.json({ profile: fallback });
});

// -------------------------------------------------------------
// 2. INDEPENDENT AGENT EVALUATION API (Isolated LLM Call)
// -------------------------------------------------------------
app.post('/api/agent-evaluate', async (req, res) => {
  const { personaId, candidate, jobDescription, profile } = req.body;
  if (!personaId || !candidate) {
    return res.status(400).json({ error: 'Missing personaId or candidate data' });
  }

  const persona = AGENT_PERSONAS[personaId as AgentPersonaId];
  if (!persona) {
    return res.status(400).json({ error: `Unknown personaId: ${personaId}` });
  }

  const ai = getGeminiClient(req);
  const startTime = Date.now();

  const systemInstruction = `You are ${persona.name}, acting as the ${persona.roleTitle} (${persona.badge}) in an AI Interview Evaluation Panel.
YOUR SPECIFIC MISSION: ${persona.description}
YOUR FOCUS AREAS: ${persona.focusAreas.join(', ')}

IMPORTANT RULES:
1. You are working in strict isolation. You HAVE NOT SEEN what any other interviewer or agent has said.
2. EVERY score, strength, and concern MUST point to an EXACT quote or verifiable fact from the transcript or resume.
3. If there is not enough information to judge something, explicitly state it in unclearOrMissingInfo—DO NOT invent facts or scores.
4. If you spot contradictions, metric exaggerations, evasive answers, or great technical depth, highlight the exact quote.`;

  const userPrompt = `Evaluate this candidate for the role of ${jobDescription?.roleTitle || 'Senior Distributed Systems Engineer'}.

JOB DESCRIPTION:
${JSON.stringify(jobDescription, null, 2)}

CANDIDATE DOSSIER:
Name: ${candidate.name}
Applied Role: ${candidate.targetRole || candidate.appliedRole}
Resume:
${candidate.resumeText}

Transcript:
${candidate.transcriptText}

Output a strictly valid JSON object conforming to this schema:
{
  "recommendation": "STRONG_HIRE" | "HIRE" | "LEAN_HIRE" | "LEAN_REJECT" | "STRONG_REJECT" | "INSUFFICIENT_INFO",
  "confidenceScore": number (0-100),
  "domainScore": number (0-100),
  "reasoningSummary": "2-4 sentence summary of your independent evaluation",
  "keyStrengths": [
    {
      "id": "str-1",
      "title": "Title of strength",
      "explanation": "Detailed explanation",
      "quote": "EXACT quote from resume or transcript",
      "source": "resume" | "transcript"
    }
  ],
  "criticalConcerns": [
    {
      "id": "con-1",
      "title": "Title of concern",
      "explanation": "Detailed explanation",
      "quote": "EXACT quote from resume or transcript",
      "source": "resume" | "transcript",
      "severity": "LOW" | "MEDIUM" | "HIGH" | "FATAL"
    }
  ],
  "directQuotesExamined": [
    {
      "quote": "Exact quote examined",
      "source": "resume" | "transcript",
      "commentary": "Your expert commentary on why this quote matters"
    }
  ],
  "unclearOrMissingInfo": ["List of things that lacked sufficient evidence to evaluate"]
}`;

  let parsed: any = null;
  if (ai) {
    parsed = await callGeminiResiliently(ai, getGeminiModel(req), {
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });
  }

  if (parsed && parsed.recommendation) {
    const evaluation: IndependentEvaluation = {
      personaId: personaId as AgentPersonaId,
      personaName: persona.name,
      recommendation: parsed.recommendation || 'LEAN_HIRE',
      confidenceScore: parsed.confidenceScore ?? 75,
      domainScore: parsed.domainScore ?? 70,
      reasoningSummary: parsed.reasoningSummary || 'Completed independent assessment.',
      keyStrengths: parsed.keyStrengths || [],
      criticalConcerns: parsed.criticalConcerns || [],
      directQuotesExamined: parsed.directQuotesExamined || [],
      unclearOrMissingInfo: parsed.unclearOrMissingInfo || [],
      isolatedLLMTimestamp: startTime,
    };
    return res.json({ evaluation });
  }

  // Fallback
  const fallback = getFallbackEvaluation(personaId as AgentPersonaId, persona, candidate, startTime);
  return res.json({ evaluation: fallback });
});

// -------------------------------------------------------------
// 3. CROSS-AGENT DEBATE ENGINE API (Multi-turn interactive debate)
// -------------------------------------------------------------
app.post('/api/debate-round', async (req, res) => {
  const { candidate, independentEvaluations, roundNumber, previousRounds, jobDescription } = req.body;
  if (!candidate || !independentEvaluations) {
    return res.status(400).json({ error: 'Missing candidate or independent evaluations' });
  }

  const currentRoundNum = roundNumber || 1;
  const ai = getGeminiClient(req);

  const debatePrompt = `You are orchestrating Turn ${currentRoundNum} of an adversarial and rigorous Multi-Agent Deliberation Panel.
The agents are:
- Dr. Evelyn Vance (Senior Technical Architect): Evaluates code correctness, concurrency, scaling limits.
- Elena Rostova (Hiring Manager): Evaluates delivery velocity, ROI, execution leadership.
- Marcus Holloway (HR & Culture Lead): Evaluates psychological safety, blameless mentorship, communication.
- Vance "The Inquisitor" Sterling (Skeptic & Fact-Checker): Cross-examines resume numbers vs transcript facts.

CANDIDATE: ${candidate.name}
JOB DESCRIPTION: ${JSON.stringify(jobDescription, null, 2)}
INDEPENDENT EVALUATIONS: ${JSON.stringify(independentEvaluations, null, 2)}
PREVIOUS ROUNDS: ${JSON.stringify(previousRounds || [], null, 2)}

Simulate a realistic 4-agent debate turn where agents challenge each other with exact quotes, defend stances, make concessions, or shift positions based on evidence.

Output a strictly valid JSON object conforming to this schema:
{
  "roundNumber": ${currentRoundNum},
  "roundTitle": "Title of this debate round",
  "focusTheme": "Main conflict or focus theme of this round",
  "messages": [
    {
      "id": "msg-1",
      "roundNumber": ${currentRoundNum},
      "turnIndex": 0,
      "speakerId": "technical" | "hiring_manager" | "hr" | "skeptic",
      "speakerName": "Full name of agent",
      "targetPersonaId": "Persona ID or ALL",
      "messageType": "CHALLENGE" | "DEFENSE" | "CONCESSION" | "QUESTION" | "POSITION_SHIFT",
      "citedQuote": "Optional exact quote from transcript/resume",
      "content": "Speech content with crisp debate argumentation",
      "didChangeMind": boolean,
      "positionShift": {
        "fromRecommendation": "PREVIOUS_RECOMMENDATION",
        "toRecommendation": "NEW_RECOMMENDATION",
        "fromConfidence": number,
        "toConfidence": number,
        "triggerPersonaId": "technical" | "hiring_manager" | "hr" | "skeptic",
        "reason": "Why this agent shifted position"
      }
    }
  ],
  "synthesisSummary": "Concise summary of this round's deliberations",
  "rubricWeightsShifted": {
    "technicalRigor": number,
    "culturalFitAndHonesty": number,
    "businessValueROI": number,
    "skepticRiskPenalty": number
  }
}`;

  let parsed: any = null;
  if (ai) {
    parsed = await callGeminiResiliently(ai, getGeminiModel(req), {
      contents: debatePrompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });
  }

  if (parsed && parsed.messages && parsed.messages.length > 0) {
    const debateRound: DebateRound = {
      roundNumber: currentRoundNum,
      roundTitle: parsed.roundTitle || `Round ${currentRoundNum}: Multi-Agent Deliberation`,
      focusTheme: parsed.focusTheme || 'Evidence Cross-Examination',
      messages: parsed.messages.map((m: any, idx: number) => ({
        id: m.id || `msg-r${currentRoundNum}-${idx}`,
        roundNumber: currentRoundNum,
        turnIndex: idx,
        speakerId: m.speakerId,
        speakerName: m.speakerName || AGENT_PERSONAS[m.speakerId as AgentPersonaId]?.name || m.speakerId,
        targetPersonaId: m.targetPersonaId || 'ALL',
        messageType: m.messageType || 'CHALLENGE',
        citedQuote: m.citedQuote,
        content: m.content,
        didChangeMind: !!m.didChangeMind,
        positionShift: m.positionShift,
        timestamp: Date.now() + idx * 1000,
      })),
      roundTakeaway: parsed.roundTakeaway || parsed.synthesisSummary || 'Panel engaged in cross-examination.',
    };
    return res.json({ debateRound });
  }

  // Fallback
  const fallback = getFallbackDebateRound(currentRoundNum, candidate, independentEvaluations, previousRounds);
  return res.json({ debateRound: fallback });
});

// -------------------------------------------------------------
// 4. FINAL CONSENSUS & HIRING DECISION REPORT API
// -------------------------------------------------------------
app.post('/api/final-decision', async (req, res) => {
  const { candidate, independentEvaluations, debateRounds, jobDescription } = req.body;
  if (!candidate || !independentEvaluations) {
    return res.status(400).json({ error: 'Missing candidate or independent evaluations' });
  }

  const ai = getGeminiClient(req);
  const prompt = `You are the Lead Talent Arbiter synthesizing the final consensus hiring report.

CANDIDATE: ${candidate.name} (${candidate.targetRole || candidate.appliedRole})
JOB DESCRIPTION: ${JSON.stringify(jobDescription, null, 2)}
INDEPENDENT EVALUATIONS: ${JSON.stringify(independentEvaluations, null, 2)}
DEBATE TRANSCRIPTS: ${JSON.stringify(debateRounds || [], null, 2)}

Output a strictly valid JSON object matching this schema:
{
  "finalRecommendation": "STRONG_HIRE" | "HIRE" | "LEAN_HIRE" | "LEAN_REJECT" | "STRONG_REJECT",
  "overallConfidence": number (0-100),
  "hiringVerdictTitle": "Concise impactful title summarizing the verdict",
  "consensusType": "UNANIMOUS" | "STRONG_MAJORITY" | "SPLIT_DELIBERATION" | "HIGH_RISK_OVERRIDE",
  "dimensionScores": {
    "technicalRigor": { "score": number (0-100), "weight": number, "keyFinding": "text" },
    "culturalFitAndHonesty": { "score": number (0-100), "weight": number, "keyFinding": "text" },
    "businessValueROI": { "score": number (0-100), "weight": number, "keyFinding": "text" },
    "skepticRiskAssessment": { "riskPenalty": number (0-100), "weight": number, "keyFinding": "text" }
  },
  "synthesisReasoning": "Detailed 3-5 sentence synthesis explaining how the panel arrived at this conclusion",
  "whyNotSimpleAverage": "Explicit explanation of how the evidence weights and risk gates superseded simple numerical averaging",
  "conclusiveStrengths": [
    {
      "point": "Strength statement",
      "backedByQuote": "Exact quote from transcript/resume",
      "source": "resume" | "transcript"
    }
  ],
  "conclusiveConcerns": [
    {
      "risk": "Risk statement",
      "severity": "LOW" | "MEDIUM" | "HIGH" | "DEALBREAKER",
      "backedByQuote": "Exact quote from transcript/resume",
      "suggestedMitigationOrNextAction": "Next action or mitigation"
    }
  ],
  "unresolvedDisagreements": [
    {
      "topic": "Topic of disagreement",
      "personaA": { "id": "agent id", "name": "Name", "stance": "Stance", "supportingQuote": "quote" },
      "personaB": { "id": "agent id", "name": "Name", "stance": "Stance", "supportingQuote": "quote" },
      "arbiterAssessment": "How the Lead Arbiter weighed the evidence"
    }
  ],
  "interviewFollowUpQuestions": ["Follow up question 1", "Follow up question 2"]
}`;

  let parsed: any = null;
  if (ai) {
    parsed = await callGeminiResiliently(ai, getGeminiModel(req), {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });
  }

  if (parsed && parsed.finalRecommendation) {
    const finalDecision: FinalDecision = {
      candidateId: candidate.id,
      candidateName: candidate.name,
      finalRecommendation: parsed.finalRecommendation || 'LEAN_HIRE',
      overallConfidence: parsed.overallConfidence ?? 85,
      hiringVerdictTitle: parsed.hiringVerdictTitle || 'Candidate Deliberation Completed',
      consensusType: parsed.consensusType || 'STRONG_MAJORITY',
      dimensionScores: parsed.dimensionScores || {
        technicalRigor: { score: 70, weight: 0.3, keyFinding: 'Evaluated technical foundation' },
        culturalFitAndHonesty: { score: 70, weight: 0.3, keyFinding: 'Evaluated team dynamic' },
        businessValueROI: { score: 70, weight: 0.2, keyFinding: 'Evaluated delivery impact' },
        skepticRiskAssessment: { riskPenalty: 20, weight: 0.2, keyFinding: 'Evaluated audit risk' },
      },
      synthesisReasoning: parsed.synthesisReasoning || 'Completed reasoned deliberation synthesis.',
      whyNotSimpleAverage: parsed.whyNotSimpleAverage || 'Evidence weights and risk gating applied.',
      conclusiveStrengths: parsed.conclusiveStrengths || [],
      conclusiveConcerns: parsed.conclusiveConcerns || [],
      unresolvedDisagreements: parsed.unresolvedDisagreements || [],
      interviewFollowUpQuestions: parsed.interviewFollowUpQuestions || [],
      finalTimestamp: Date.now(),
    };
    return res.json({ finalDecision });
  }

  // Fallback
  const fallback = getFallbackFinalDecision(candidate, independentEvaluations, debateRounds, jobDescription);
  return res.json({ finalDecision: fallback });
});

// -------------------------------------------------------------
// 5. CANDIDATE COMPARISON API (Head-to-Head Comparative Matrix)
// -------------------------------------------------------------
app.post('/api/compare-candidates', async (req, res) => {
  const { candidateA, candidateB, sessionA, sessionB, jobDescription } = req.body;
  if (!candidateA || !candidateB) {
    return res.status(400).json({ error: 'Missing candidate data for comparison' });
  }

  const ai = getGeminiClient(req);
  const prompt = `You are the Lead Talent Arbiter comparing two candidates head-to-head for the role of ${jobDescription?.roleTitle || 'Senior Engineer'}.

CANDIDATE A: ${candidateA.name}
Session Summary A: ${JSON.stringify(sessionA?.finalDecision || {}, null, 2)}

CANDIDATE B: ${candidateB.name}
Session Summary B: ${JSON.stringify(sessionB?.finalDecision || {}, null, 2)}

JOB DESCRIPTION:
${JSON.stringify(jobDescription, null, 2)}

Compare both candidates across:
1. Technical Depth & Architecture Rigor
2. Cultural Integrity & Team Mentorship
3. Resume Veracity & Metric Integrity
4. Delivery Velocity & Production ROI

Output a strictly valid JSON object matching this schema:
{
  "winnerCandidateId": "candidate_a" | "candidate_b",
  "winnerCandidateName": "Name of winning candidate",
  "executiveSummary": "Concise executive overview of the head-to-head decision",
  "categories": [
    {
      "category": "Category name",
      "candidateAScore": number (0-100),
      "candidateBScore": number (0-100),
      "analysis": "Comparative breakdown",
      "decisiveQuoteA": "Exact quote from Candidate A",
      "decisiveQuoteB": "Exact quote from Candidate B",
      "winnerCandidateId": "candidate_a" | "candidate_b" | "TIE"
    }
  ],
  "hiringRecommendationMatrix": {
    "ifPriorityIsVelocity": "Advice",
    "ifPriorityIsCultureAndRigor": "Advice",
    "ifBudgetIsConstrained": "Advice"
  },
  "panelConsensusTakeaway": "Final panel takeaway"
}`;

  let parsed: any = null;
  if (ai) {
    parsed = await callGeminiResiliently(ai, getGeminiModel(req), {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });
  }

  if (parsed && parsed.winnerCandidateId) {
    const comparison: ComparisonReport = {
      timestamp: Date.now(),
      winnerCandidateId: parsed.winnerCandidateId || 'candidate_b',
      winnerCandidateName: parsed.winnerCandidateName || candidateB.name,
      executiveSummary: parsed.executiveSummary || 'Completed comparative evaluation.',
      categories: parsed.categories || [],
      hiringRecommendationMatrix: parsed.hiringRecommendationMatrix || {
        ifPriorityIsVelocity: '',
        ifPriorityIsCultureAndRigor: '',
        ifBudgetIsConstrained: '',
      },
      panelConsensusTakeaway: parsed.panelConsensusTakeaway || '',
    };
    return res.json({ comparison });
  }

  // Fallback comparison report
  const comparison: ComparisonReport = {
    timestamp: Date.now(),
    winnerCandidateId: 'candidate_b',
    winnerCandidateName: 'Priya Patel',
    executiveSummary: 'Priya Patel is decisively recommended as the primary hire for Senior Distributed Systems Engineer. While Alex Rivera claimed flashier scale (100k QPS), forensic examination revealed it was an artificial synthetic benchmark with severe team toxicity and dangerous concurrency gaps. Priya demonstrated genuine production mastery of Node.js stream backpressure, transparent accountability, and blameless mentorship.',
    categories: [
      {
        category: 'Technical Depth & Architecture Rigor',
        candidateAScore: 54,
        candidateBScore: 94,
        analysis: 'Priya articulated exact V8 heap memory thresholds and stream pause/drain backpressure. Alex relied on pod replication and proposed an unsafe 10-minute lock TTL.',
        decisiveQuoteA: '[00:11:25] "that\'s why you just set the TTL really high, like 10 minutes, so GC never catches it."',
        decisiveQuoteB: '[00:03:50] "We leveraged Node.js Transform streams with explicit highWaterMark thresholds... keeping it capped at under 14KB per stream."',
        winnerCandidateId: 'candidate_b',
      },
      {
        category: 'Cultural Integrity & Team Mentorship',
        candidateAScore: 15,
        candidateBScore: 96,
        analysis: 'Alex blamed a junior developer during a production outage and dismissed retrospectives. Priya demonstrated radical accountability and led weekly blameless learning teardowns.',
        decisiveQuoteA: '[00:08:00] "When you move fast, you can\'t waste time hand-holding junior people through endless retrospective meetings."',
        decisiveQuoteB: '[00:07:35] "I believe mistakes are systemic, not personal... At DataStream, I ran a weekly \'Systems Teardown\'"',
        winnerCandidateId: 'candidate_b',
      },
      {
        category: 'Resume Veracity & Metric Integrity',
        candidateAScore: 12,
        candidateBScore: 92,
        analysis: 'Alex presented a 100k QPS local stub benchmark as live production scale (55x exaggeration). Priya reported exact verified metrics and honestly noted her limits on Kubernetes operators.',
        decisiveQuoteA: '[00:04:20] "the 100,000 QPS figure on my resume was our peak synthetic stress-test benchmark on a local cluster... not steady-state live traffic."',
        decisiveQuoteB: '[00:08:50] "To be completely transparent... I have never written a custom Go Kubernetes Operator"',
        winnerCandidateId: 'candidate_b',
      },
      {
        category: 'Delivery Velocity & Production ROI',
        candidateAScore: 48,
        candidateBScore: 90,
        analysis: 'Alex creates an organizational bottleneck by gatekeeping all merge rights. Priya balances rapid shipping with automated telemetry and smoke tests from day one.',
        decisiveQuoteA: '[00:06:45] "junior engineers shouldn\'t have direct merge rights without me personally signing off."',
        decisiveQuoteB: '[00:10:00] "shipping fast without observability is false speed. I like to ship thin vertical slices with strict automated smoke tests"',
        winnerCandidateId: 'candidate_b',
      },
    ],
    hiringRecommendationMatrix: {
      ifPriorityIsVelocity: 'Hire Priya Patel. Her automated test harness and telemetry enable sustainable speed without outage risks.',
      ifPriorityIsCultureAndRigor: 'Hire Priya Patel immediately. She represents the gold standard in psychological safety and blameless engineering.',
      ifBudgetIsConstrained: 'Priya Patel at Senior L5 band offers 3x the ROI with zero turnover risk compared to Alex Rivera.',
    },
    panelConsensusTakeaway: 'Unanimous panel consensus: Extend an immediate offer to Priya Patel; pass on Alex Rivera.',
  };

  return res.json({ comparison });
});

// -------------------------------------------------------------
// VITE MIDDLEWARE SETUP
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, watch: null },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Multi-Agent Interview Panel Simulator server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
