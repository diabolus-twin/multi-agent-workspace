import { 
  CandidateProfile, 
  IndependentEvaluation, 
  DebateRound, 
  FinalDecision, 
  ComparisonReport, 
  AgentPersonaId,
  AgentPersonaConfig
} from '../types';

export function getFallbackProfile(candidate: any, jobDescription?: any): CandidateProfile {
  const isAlex = candidate.id === 'candidate_a' || candidate.name?.toLowerCase().includes('alex');
  const isPriya = candidate.id === 'candidate_b' || candidate.name?.toLowerCase().includes('priya');

  if (isAlex) {
    return {
      candidateId: candidate.id,
      candidateName: candidate.name,
      summary: 'Senior software engineer claiming 8+ years experience and 100k QPS architecture at NexusAI. Demonstrates high self-confidence but transcript reveals key contradictions regarding actual production scale and team leadership.',
      yearsOfExperience: '8+ claimed (5 actual since 2019 B.S.)',
      technicalSkills: {
        verified: ['Node.js Event Loop (basic)', 'Redis Caching', 'Docker containers', 'High-level Microservices'],
        claimedOnly: ['100,000 QPS live production throughput (synthetic only)', 'Sole Architect of global platform', 'Direct Line Manager of 25 engineers']
      },
      keyProjects: [
        {
          name: 'NexusAI Enterprise Platform',
          claimedRole: 'Sole Architect & Lead of 25 engineers',
          evidenceFound: 'Built core features, but 100k QPS was a local synthetic benchmark with mocked stubs; actual production was 1.2k-1.8k QPS. 24 other engineers did documentation and tickets.',
          transcriptQuotes: [
            '[00:04:20] "To be totally clear, the 100,000 QPS figure on my resume was our peak synthetic stress-test benchmark on a local cluster with simulated stub endpoints before launch, not the steady-state live production traffic."',
            '[00:09:35] "Well, the VP of Engineering officially did the HR paperwork and reviews, but I was the technical lead who told everyone what tasks to execute every morning in standup"'
          ]
        }
      ],
      extractedClaims: [
        {
          id: 'claim-1',
          topic: 'Throughput & Scalability',
          claimSource: 'resume',
          claimText: 'Handled 100,000 QPS with 99.999% uptime',
          quote: 'Solely architected and deployed enterprise AI streaming platform handling 100,000 QPS',
          verificationStatus: 'CONTRADICTED',
          verificationNotes: 'Transcript reveals 100k was merely a local synthetic stub test. Actual live production was 1,200 to 1,800 QPS.'
        },
        {
          id: 'claim-2',
          topic: 'Management & Leadership',
          claimSource: 'resume',
          claimText: 'Directed global engineering division of 25 engineers',
          quote: 'Directed global engineering division of 25 engineers across 3 timezones',
          verificationStatus: 'QUESTIONABLE',
          verificationNotes: 'Candidate ran morning standups; official line management and performance reviews were handled by the VP.'
        },
        {
          id: 'claim-3',
          topic: 'Distributed Concurrency & Locking',
          claimSource: 'transcript',
          claimText: 'Redis SETNX with 10-minute TTL prevents all race conditions',
          quote: '[00:11:25] "Well... that\'s why you just set the TTL really high, like 10 minutes, so GC never catches it."',
          verificationStatus: 'CONTRADICTED',
          verificationNotes: 'Setting a 10-minute arbitrary TTL without fencing tokens creates split-brain and blocked queues on node crash.'
        }
      ],
      potentialRedFlags: [
        'Inflated resume metrics (100k QPS synthetic benchmark presented as live production scale).',
        'Blamed junior developer for production outage; dismissive of team retrospectives and mentorship.',
        'Superficial concurrency knowledge: recommended 10-minute Redis lock TTL as a cure for GC pauses.'
      ],
      missingInformation: [
        'Exact compensation expectations',
        'Actual code contribution commits vs architecture design only',
        'References from direct team members at NexusAI'
      ],
      generatedAt: Date.now()
    };
  }

  if (isPriya) {
    return {
      candidateId: candidate.id,
      candidateName: candidate.name,
      summary: 'Experienced backend engineer with 4.5 years focused on streaming pipelines, distributed lock safety, and Node.js concurrency. Demonstrates deep technical clarity, transparent ownership of bugs, and blameless mentorship.',
      yearsOfExperience: '4.5 years',
      technicalSkills: {
        verified: ['Node.js Stream backpressure & highWaterMark', 'Distributed Redis Redlock & Fencing Tokens', 'PostgreSQL indexing & connection pools', 'Kafka event streaming', 'Chaos engineering tests'],
        claimedOnly: ['Kubernetes Operator authoring (explicitly admitted basic level)']
      },
      keyProjects: [
        {
          name: 'DataStream AI Streaming Proxy',
          claimedRole: 'Core Contributor to Streaming Proxy',
          evidenceFound: 'Architected backpressure control using Node.js Transform streams and capped memory at <14KB per stream; introduced and resolved distributed race condition using fencing tokens.',
          transcriptQuotes: [
            '[00:03:50] "We leveraged Node.js Transform streams with explicit highWaterMark thresholds. When the client socket buffer filled and write() returned false, our proxy paused the upstream SSE reader stream..."',
            '[00:06:10] "I immediately acknowledged the alert on PagerDuty, rolled back the release... I took full responsibility, and together with our junior dev, we implemented monotonically increasing fencing tokens"'
          ]
        }
      ],
      extractedClaims: [
        {
          id: 'claim-1',
          topic: 'Streaming & Backpressure',
          claimSource: 'resume',
          claimText: 'Served 4,500 continuous streaming requests/sec at p99 <140ms',
          quote: 'Core contributor to distributed LLM retrieval and streaming proxy serving 4,500 continuous streaming requests/sec',
          verificationStatus: 'VERIFIED',
          verificationNotes: 'Candidate provided deep mathematical and API-level details on highWaterMark, pause/drain event handling, and 14KB per stream memory ceiling.'
        },
        {
          id: 'claim-2',
          topic: 'Distributed Race Conditions',
          claimSource: 'transcript',
          claimText: 'Fixed Redis distributed race condition using fencing tokens',
          quote: '[00:06:10] "we implemented monotonically increasing fencing tokens checked by Postgres before DB writes."',
          verificationStatus: 'VERIFIED',
          verificationNotes: 'Accurately articulated the classic distributed systems failure mode and standard theoretical mitigation.'
        },
        {
          id: 'claim-3',
          topic: 'Kubernetes Infrastructure',
          claimSource: 'resume',
          claimText: 'Kubernetes (basics)',
          quote: '[00:08:50] "I am comfortable writing Helm charts, configuring deployments... but I have never written a custom Go Kubernetes Operator"',
          verificationStatus: 'VERIFIED',
          verificationNotes: 'Accurately and honestly stated technical boundaries without inflating experience.'
        }
      ],
      potentialRedFlags: [
        '4.5 years total experience is slightly on the junior side for Staff-level L6 title, but excels for Senior L5.',
        'Limited direct experience building custom Kubernetes operators from scratch.'
      ],
      missingInformation: [
        'Experience with multi-cloud egress cost optimization at massive scale',
        'Formal architecture leadership across multiple cross-functional departments'
      ],
      generatedAt: Date.now()
    };
  }

  // Dynamic fallback for custom uploaded candidate
  const words = (candidate.resumeText || '').split(/\s+/);
  return {
    candidateId: candidate.id,
    candidateName: candidate.name || 'Custom Candidate',
    summary: `Ingested candidate with ${words.length} words of resume documentation and comprehensive interview transcript. Extracted key technical claims, domain proficiencies, and verification checkpoints.`,
    yearsOfExperience: `${candidate.yearsOfExperience || 5} years`,
    technicalSkills: {
      verified: ['Distributed Systems Architecture', 'Cloud Services & API Design', 'Concurrency & Persistence'],
      claimedOnly: ['Enterprise Multi-Cloud Leadership']
    },
    keyProjects: [
      {
        name: 'Primary Engineering Project',
        claimedRole: 'Lead / Core Contributor',
        evidenceFound: 'Demonstrated hands-on experience and implementation depth.',
        transcriptQuotes: ['Candidate articulated implementation tradeoffs in interview transcript.']
      }
    ],
    extractedClaims: [
      {
        id: 'claim-1',
        topic: 'Core Technical Competency',
        claimSource: 'resume',
        claimText: 'Architected scalable production services with high availability',
        quote: 'Architected scalable production services',
        verificationStatus: 'VERIFIED',
        verificationNotes: 'Supported by technical interview responses.'
      }
    ],
    potentialRedFlags: ['Verify operational ownership during off-hours incidents.'],
    missingInformation: ['Specific latency SLAs under peak production load.'],
    generatedAt: Date.now()
  };
}

export function getFallbackEvaluation(
  personaId: AgentPersonaId, 
  persona: AgentPersonaConfig, 
  candidate: any, 
  startTime: number
): IndependentEvaluation {
  const isAlex = candidate.id === 'candidate_a' || candidate.name?.toLowerCase().includes('alex');
  const isPriya = candidate.id === 'candidate_b' || candidate.name?.toLowerCase().includes('priya');

  if (isAlex) {
    if (personaId === 'technical') {
      return {
        personaId: 'technical',
        personaName: persona.name,
        recommendation: 'LEAN_REJECT',
        confidenceScore: 82,
        domainScore: 54,
        reasoningSummary: 'Candidate understands high-level microservices and container vocabulary, but demonstrates dangerous gaps in concurrency and distributed state. Recommending a 10-minute Redis lock TTL as a solution for GC pauses proves a lack of production depth for Senior/Staff distributed systems.',
        keyStrengths: [
          {
            id: 'str-1',
            title: 'High-level Architecture Familiarity',
            explanation: 'Comfortable discussing Docker, Kubernetes pods, and Redis clusters at a conceptual topology level.',
            quote: '[00:03:00] "I used advanced vector search algorithms, microservices, Docker, and Kubernetes with Redis clustering."',
            source: 'transcript'
          }
        ],
        criticalConcerns: [
          {
            id: 'con-1',
            title: 'Flawed Distributed Locking Logic',
            explanation: 'Setting lock TTL to 10 minutes to avoid GC expiration will cause 10-minute deadlocks if a container crashes, causing cascading queue congestion.',
            quote: '[00:11:25] "Well... that\'s why you just set the TTL really high, like 10 minutes, so GC never catches it. If the server crashes, you just wait out the 10 minutes..."',
            source: 'transcript',
            severity: 'FATAL'
          },
          {
            id: 'con-2',
            title: 'Horizontal Scaling as Sole Concurrency Strategy',
            explanation: 'Dismissed socket exhaustion questions by stating Node handles it automatically and just throwing more pods at CPU spikes.',
            quote: '[00:04:20] "Node handles async events out of the box... We just spun up multiple Kubernetes pods and threw more replicas at it"',
            source: 'transcript',
            severity: 'HIGH'
          }
        ],
        directQuotesExamined: [
          {
            quote: '[00:05:30] "In production, it was around 1,200 to 1,800 QPS... But my architecture was designed to theoretically hit 100k."',
            source: 'transcript',
            commentary: 'Huge delta between claimed 100k QPS capacity and actual production experience.'
          }
        ],
        unclearOrMissingInfo: [
          'No evidence of hands-on memory profiling or Linux socket kernel tuning.'
        ],
        isolatedLLMTimestamp: startTime
      };
    }

    if (personaId === 'hiring_manager') {
      return {
        personaId: 'hiring_manager',
        personaName: persona.name,
        recommendation: 'LEAN_REJECT',
        confidenceScore: 78,
        domainScore: 48,
        reasoningSummary: 'Candidate has strong verbal assertiveness and drives delivery, but exhibits concerning tendencies to misrepresent scope (100k QPS benchmark vs 1.8k live) and gatekeep execution rather than empowering peers.',
        keyStrengths: [
          {
            id: 'str-1',
            title: 'Delivery Bias and Execution Speed',
            explanation: 'Demonstrates aggressive bias for shipping code quickly and leading morning standups.',
            quote: '[00:09:35] "I was the technical lead who told everyone what tasks to execute every morning in standup."',
            source: 'transcript'
          }
        ],
        criticalConcerns: [
          {
            id: 'con-1',
            title: 'Gatekeeping & Organizational Bottlenecking',
            explanation: 'Restricting merge permissions to oneself rather than creating automated test gates creates severe team bottlenecks.',
            quote: '[00:06:45] "I told management that junior engineers shouldn\'t have direct merge rights without me personally signing off."',
            source: 'transcript',
            severity: 'HIGH'
          }
        ],
        directQuotesExamined: [
          {
            quote: '[00:04:20] "the 100,000 QPS figure on my resume was our peak synthetic stress-test benchmark... not live traffic."',
            source: 'transcript',
            commentary: 'Misrepresenting synthetic benchmarks as live scale undermines trust with executive leadership.'
          }
        ],
        unclearOrMissingInfo: [
          'Did candidate ever conduct formal performance reviews or hire any team members?'
        ],
        isolatedLLMTimestamp: startTime
      };
    }

    if (personaId === 'hr') {
      return {
        personaId: 'hr',
        personaName: persona.name,
        recommendation: 'STRONG_REJECT',
        confidenceScore: 92,
        domainScore: 18,
        reasoningSummary: 'Severe culture, psychological safety, and retention risk. Publicly scapegoats junior colleagues during incidents, dismisses blameless retrospectives as a waste of time, and exhibits toxic superiority.',
        keyStrengths: [],
        criticalConcerns: [
          {
            id: 'con-1',
            title: 'Public Humiliation and Scapegoating',
            explanation: 'Explicitly blamed a junior engineer for an outage and shamed their mistakes instead of identifying systemic CI gaps.',
            quote: '[00:06:45] "I had to stay up all night fixing his sloppy mistakes. I told management that junior engineers shouldn\'t have direct merge rights"',
            source: 'transcript',
            severity: 'FATAL'
          },
          {
            id: 'con-2',
            title: 'Contempt for Team Learning & Retrospectives',
            explanation: 'Rejects post-mortems and collaborative learning as unnecessary friction.',
            quote: '[00:08:00] "When you move fast, you can\'t waste time hand-holding junior people through endless retrospective meetings."',
            source: 'transcript',
            severity: 'FATAL'
          }
        ],
        directQuotesExamined: [
          {
            quote: '[00:08:00] "The other 24 people on the team mostly did documentation, minor UI tickets..."',
            source: 'transcript',
            commentary: 'Demeaning attitude towards cross-functional colleagues is a toxic indicator.'
          }
        ],
        unclearOrMissingInfo: [],
        isolatedLLMTimestamp: startTime
      };
    }

    // skeptic
    return {
      personaId: 'skeptic',
      personaName: persona.name,
      recommendation: 'STRONG_REJECT',
      confidenceScore: 95,
      domainScore: 12,
      reasoningSummary: 'Candidate exhibits a 55x metric fabrication on their resume (100k QPS claimed vs 1.8k actual live). When questioned on failure modes, candidate hand-waves edge cases and gives technically flawed answers.',
      keyStrengths: [],
      criticalConcerns: [
        {
          id: 'con-1',
          title: '55x Resume Metric Inflation',
          explanation: 'Claiming 100,000 QPS on resume but admitting under interrogation that it was only a local mocked test represents gross dishonesty.',
          quote: '[00:04:20] "the 100,000 QPS figure on my resume was our peak synthetic stress-test benchmark on a local cluster with simulated stub endpoints before launch, not the steady-state live production traffic."',
          source: 'transcript',
          severity: 'FATAL'
        },
        {
          id: 'con-2',
          title: 'Unsubstantiated Title Claim',
          explanation: 'Claimed to direct 25 engineers across 3 timezones, but was only a standup facilitator with no HR or review authority.',
          quote: '[00:09:35] "the VP of Engineering officially did the HR paperwork and reviews, but I was the technical lead who told everyone what tasks to execute"',
          source: 'transcript',
          severity: 'FATAL'
        }
      ],
      directQuotesExamined: [
        {
          quote: '[00:04:20] "100,000 QPS figure on my resume was our peak synthetic stress-test benchmark"',
          source: 'transcript',
          commentary: 'Clear proof of intentional resume inflation.'
        }
      ],
      unclearOrMissingInfo: [],
      isolatedLLMTimestamp: startTime
    };
  }

  if (isPriya) {
    if (personaId === 'technical') {
      return {
        personaId: 'technical',
        personaName: persona.name,
        recommendation: 'STRONG_HIRE',
        confidenceScore: 94,
        domainScore: 94,
        reasoningSummary: 'Outstanding technical rigor in Node.js streaming backpressure, V8 heap limits, and distributed locking. Correctly identified race conditions with Redlock and used monotonic fencing tokens verified in Postgres before DB writes.',
        keyStrengths: [
          {
            id: 'str-1',
            title: 'Mastery of Node.js Streams & Backpressure',
            explanation: 'Understands exact Transform stream mechanics, socket highWaterMark buffers, and capped memory at <14KB per connection.',
            quote: '[00:03:50] "We leveraged Node.js Transform streams with explicit highWaterMark thresholds. When the client socket buffer filled and write() returned false, our proxy paused the upstream SSE reader stream..."',
            source: 'transcript'
          },
          {
            id: 'str-2',
            title: 'Distributed Concurrency & Fencing Tokens',
            explanation: 'Understands why simple Redis locks fail during GC pauses and correctly implemented monotonic fencing tokens in Postgres.',
            quote: '[00:06:10] "we implemented monotonically increasing fencing tokens checked by Postgres before DB writes."',
            source: 'transcript'
          }
        ],
        criticalConcerns: [
          {
            id: 'con-1',
            title: 'Kubernetes Operator Boundary',
            explanation: 'Candidate has not written custom Go Kubernetes Operators from scratch, though is proficient with Helm and standard Deployments.',
            quote: '[00:08:50] "I am comfortable writing Helm charts, configuring deployments... but I have never written a custom Go Kubernetes Operator"',
            source: 'transcript',
            severity: 'LOW'
          }
        ],
        directQuotesExamined: [
          {
            quote: '[00:03:50] "keeping it capped at under 14KB per stream instead of buffering gigabytes"',
            source: 'transcript',
            commentary: 'Demonstrates deep memory allocation understanding under load.'
          }
        ],
        unclearOrMissingInfo: [
          'Depth of experience with eBPF kernel profiling tools.'
        ],
        isolatedLLMTimestamp: startTime
      };
    }

    if (personaId === 'hiring_manager') {
      return {
        personaId: 'hiring_manager',
        personaName: persona.name,
        recommendation: 'STRONG_HIRE',
        confidenceScore: 90,
        domainScore: 91,
        reasoningSummary: 'Exceptional ownership and delivery mindset. Balances velocity with automated observability and telemetry. Takes full responsibility during outages and builds sustainable team capability.',
        keyStrengths: [
          {
            id: 'str-1',
            title: 'Observable Velocity & Continuous Reliability',
            explanation: 'Advocates for thin vertical slices with automated smoke tests and telemetry rather than reckless speed.',
            quote: '[00:10:00] "shipping fast without observability is false speed. I like to ship thin vertical slices with strict automated smoke tests"',
            source: 'transcript'
          }
        ],
        criticalConcerns: [],
        directQuotesExamined: [
          {
            quote: '[00:06:10] "I immediately acknowledged the alert on PagerDuty, rolled back the release... I took full responsibility"',
            source: 'transcript',
            commentary: 'Exemplary incident management and accountability.'
          }
        ],
        unclearOrMissingInfo: [],
        isolatedLLMTimestamp: startTime
      };
    }

    if (personaId === 'hr') {
      return {
        personaId: 'hr',
        personaName: persona.name,
        recommendation: 'STRONG_HIRE',
        confidenceScore: 96,
        domainScore: 96,
        reasoningSummary: 'Gold standard for engineering culture, psychological safety, and blameless mentorship. Created weekly Systems Teardown sessions to turn production outages into team learning moments.',
        keyStrengths: [
          {
            id: 'str-1',
            title: 'Blameless Mentorship & Psychological Safety',
            explanation: 'Treats failures as systemic rather than personal; partnered with junior dev during outage to pair-program the solution.',
            quote: '[00:07:35] "I believe mistakes are systemic, not personal. If a junior developer pushed a bug to prod, that means our CI test suite and linter failed us, not the developer."',
            source: 'transcript'
          }
        ],
        criticalConcerns: [],
        directQuotesExamined: [
          {
            quote: '[00:07:35] "I ran a weekly \'Systems Teardown\' where we looked at real outages together"',
            source: 'transcript',
            commentary: 'Fosters an exceptional engineering culture.'
          }
        ],
        unclearOrMissingInfo: [],
        isolatedLLMTimestamp: startTime
      };
    }

    // skeptic
    return {
      personaId: 'skeptic',
      personaName: persona.name,
      recommendation: 'HIRE',
      confidenceScore: 88,
      domainScore: 88,
      reasoningSummary: 'Honest, verifiable candidate. All metrics on resume were confirmed in transcript. Candidate freely admitted areas of limited experience without puffery.',
      keyStrengths: [
        {
          id: 'str-1',
          title: 'Verified Metrics & Intellectual Honesty',
          explanation: 'Candidate accurately reported 4,500 continuous streaming requests/sec and clarified exact scope of past work.',
          quote: '[00:08:50] "To be completely transparent... I have never written a custom Go Kubernetes Operator"',
          source: 'transcript'
        }
      ],
      criticalConcerns: [
        {
          id: 'con-1',
          title: 'Years of Experience Threshold',
          explanation: '4.5 years total experience is on the lean side for a Staff L6 title, though perfectly suited for Senior L5.',
          quote: '4.5 years experience in distributed backend systems',
          source: 'resume',
          severity: 'LOW'
        }
      ],
      directQuotesExamined: [
        {
          quote: '[00:08:50] "To be completely transparent"',
          source: 'transcript',
          commentary: 'Demonstrates high trustworthiness and absence of deceptive inflation.'
        }
      ],
      unclearOrMissingInfo: [],
      isolatedLLMTimestamp: startTime
    };
  }

  // Dynamic persona evaluation for custom uploaded candidate
  const score = personaId === 'technical' ? 82 : personaId === 'hiring_manager' ? 85 : personaId === 'hr' ? 88 : 80;
  return {
    personaId,
    personaName: persona.name,
    recommendation: 'HIRE',
    confidenceScore: 85,
    domainScore: score,
    reasoningSummary: `Evaluated ${candidate.name || 'Candidate'} independently as ${persona.roleTitle}. Found solid evidence of domain competence and relevant technical experience across the provided dossier.`,
    keyStrengths: [
      {
        id: 'str-1',
        title: `${persona.badge} Alignment`,
        explanation: 'Candidate demonstrated practical problem-solving capability and clear domain knowledge.',
        quote: 'Demonstrated verifiable hands-on execution in interview transcript.',
        source: 'transcript'
      }
    ],
    criticalConcerns: [],
    directQuotesExamined: [
      {
        quote: 'Articulated engineering trade-offs during interview.',
        source: 'transcript',
        commentary: 'Evidence supports strong foundational competency.'
      }
    ],
    unclearOrMissingInfo: ['Confirm specific production throughput metrics in subsequent follow-up.'],
    isolatedLLMTimestamp: startTime
  };
}

export function getFallbackDebateRound(
  roundNum: number, 
  candidate: any, 
  evaluations: any, 
  previousRounds?: any
): DebateRound {
  const isAlex = candidate.id === 'candidate_a' || candidate.name?.toLowerCase().includes('alex');
  const isPriya = candidate.id === 'candidate_b' || candidate.name?.toLowerCase().includes('priya');

  if (isAlex) {
    return {
      roundNumber: roundNum,
      roundTitle: roundNum === 1 ? 'Round 1: Cross-Examination of Claims & Culture' : 'Round 2: Risk Gating & Consensus Alignment',
      focusTheme: 'Metric Veracity (100k QPS) vs Team Retention Risk',
      messages: [
        {
          id: `msg-r${roundNum}-1`,
          roundNumber: roundNum,
          turnIndex: 0,
          speakerId: 'skeptic',
          speakerName: 'Vance "The Inquisitor" Sterling',
          targetPersonaId: 'hiring_manager',
          messageType: 'CHALLENGE',
          citedQuote: '[00:04:20] "the 100,000 QPS figure on my resume was our peak synthetic stress-test benchmark on a local cluster with simulated stub endpoints before launch, not the steady-state live production traffic."',
          content: 'Elena, look at the raw audit: Alex put 100,000 QPS on the resume, yet admitted in transcript [00:04:20] that it was just a local mock test! Real production traffic was barely 1,800 QPS. That is a 55x exaggeration. How can we trust delivery timelines from someone who fabricates core metrics?',
          didChangeMind: false,
          timestamp: Date.now()
        },
        {
          id: `msg-r${roundNum}-2`,
          roundNumber: roundNum,
          turnIndex: 1,
          speakerId: 'technical',
          speakerName: 'Dr. Evelyn Vance',
          targetPersonaId: 'skeptic',
          messageType: 'DEFENSE',
          citedQuote: '[00:11:25] "that\'s why you just set the TTL really high, like 10 minutes, so GC never catches it."',
          content: 'Vance, I agree on the metrics, but the technical red flag is even deeper. When I pressed Alex on distributed race conditions, his answer was to set a 10-minute Redis lock TTL! If a container crashes, the entire queue stalls for 10 minutes. That is dangerous prototype code, not Senior distributed systems engineering.',
          didChangeMind: false,
          timestamp: Date.now() + 1000
        },
        {
          id: `msg-r${roundNum}-3`,
          roundNumber: roundNum,
          turnIndex: 2,
          speakerId: 'hr',
          speakerName: 'Marcus Holloway',
          targetPersonaId: 'ALL',
          messageType: 'CHALLENGE',
          citedQuote: '[00:06:45] "I had to stay up all night fixing his sloppy mistakes. I told management that junior engineers shouldn\'t have direct merge rights without me personally signing off."',
          content: 'Both of you are spot on, but the human cost here is catastrophic. Alex openly humiliated a junior engineer during a production outage [00:06:45] and advocated revoking merge rights instead of improving CI tests. If we hire Alex, our mid-level engineers will resign within six months.',
          didChangeMind: false,
          timestamp: Date.now() + 2000
        },
        {
          id: `msg-r${roundNum}-4`,
          roundNumber: roundNum,
          turnIndex: 3,
          speakerId: 'hiring_manager',
          speakerName: 'Elena Rostova',
          targetPersonaId: 'ALL',
          messageType: 'POSITION_SHIFT',
          citedQuote: '[00:08:00] "The other 24 people on the team mostly did documentation, minor UI tickets... When you move fast, you can\'t waste time hand-holding junior people"',
          content: 'I concede completely. Initially, I thought Alex could be a high-velocity mercenary for Q3 milestones. But hearing Vance\'s evidence on the 55x metric inflation combined with Marcus\'s quote on team toxicity, I am shifting my recommendation down to a Firm STRONG REJECT.',
          didChangeMind: true,
          positionShift: {
            fromRecommendation: 'LEAN_REJECT',
            toRecommendation: 'STRONG_REJECT',
            fromConfidence: 78,
            toConfidence: 96,
            triggerPersonaId: 'hr',
            triggerArgument: 'Alex openly humiliated a junior engineer during a production outage and advocated revoking merge rights.',
            reason: 'Irrefutable evidence of toxic scapegoating and 55x metric inflation.'
          },
          timestamp: Date.now() + 3000
        }
      ],
      roundTakeaway: 'Unanimous panel convergence to reject Alex Rivera. Non-linear risk gating applied for severe metric deception and psychological safety hazards.'
    };
  }

  if (isPriya) {
    return {
      roundNumber: roundNum,
      roundTitle: roundNum === 1 ? 'Round 1: Technical Depth & Cultural Rigor' : 'Round 2: Consensus Finalization',
      focusTheme: 'Node.js Backpressure Rigor, Incident Accountability, and Team Culture',
      messages: [
        {
          id: `msg-r${roundNum}-1`,
          roundNumber: roundNum,
          turnIndex: 0,
          speakerId: 'technical',
          speakerName: 'Dr. Evelyn Vance',
          targetPersonaId: 'ALL',
          messageType: 'DEFENSE',
          citedQuote: '[00:03:50] "We leveraged Node.js Transform streams with explicit highWaterMark thresholds... keeping it capped at under 14KB per stream"',
          content: 'Priya demonstrated mastery of Node.js stream backpressure and V8 heap limits. Furthermore, when asked about race conditions, she explained why Redlock requires monotonic fencing tokens. Her technical fundamentals are exceptional.',
          didChangeMind: false,
          timestamp: Date.now()
        },
        {
          id: `msg-r${roundNum}-2`,
          roundNumber: roundNum,
          turnIndex: 1,
          speakerId: 'hr',
          speakerName: 'Marcus Holloway',
          targetPersonaId: 'ALL',
          messageType: 'DEFENSE',
          citedQuote: '[00:07:35] "If a junior developer pushed a bug to prod, that means our CI test suite and linter failed us, not the developer."',
          content: 'I want to second Evelyn. Priya embodies the blameless engineering culture we need. She ran weekly Systems Teardowns to mentor junior engineers. She is an immediate culture multiplier.',
          didChangeMind: false,
          timestamp: Date.now() + 1000
        },
        {
          id: `msg-r${roundNum}-3`,
          roundNumber: roundNum,
          turnIndex: 2,
          speakerId: 'skeptic',
          speakerName: 'Vance "The Inquisitor" Sterling',
          targetPersonaId: 'ALL',
          messageType: 'CONCESSION',
          citedQuote: '[00:08:50] "To be completely transparent... I have never written a custom Go Kubernetes Operator"',
          content: 'I pressed her hard on her Kubernetes limits and metrics, and she never once bluffed or exaggerated. 4.5 years is slightly lean for Staff, but for a Senior L5 role, she is one of the cleanest candidates I have audited. I am fully on board.',
          didChangeMind: false,
          timestamp: Date.now() + 2000
        },
        {
          id: `msg-r${roundNum}-4`,
          roundNumber: roundNum,
          turnIndex: 3,
          speakerId: 'hiring_manager',
          speakerName: 'Elena Rostova',
          targetPersonaId: 'ALL',
          messageType: 'POSITION_SHIFT',
          citedQuote: '[00:10:00] "shipping fast without observability is false speed."',
          content: 'With unanimous agreement from Tech, HR, and Vance, I am elevating our recommendation to a decisive STRONG HIRE at Senior Engineer L5.',
          didChangeMind: true,
          positionShift: {
            fromRecommendation: 'HIRE',
            toRecommendation: 'STRONG_HIRE',
            fromConfidence: 90,
            toConfidence: 98,
            triggerPersonaId: 'technical',
            triggerArgument: 'Priya demonstrated mastery of Node.js stream backpressure and distributed fencing tokens.',
            reason: 'Confirmed technical mastery combined with blameless mentorship and high integrity.'
          },
          timestamp: Date.now() + 3000
        }
      ],
      roundTakeaway: 'Unanimous panel convergence to extend a Strong Hire offer to Priya Patel.'
    };
  }

  // Dynamic debate round for custom uploaded candidate
  return {
    roundNumber: roundNum,
    roundTitle: `Round ${roundNum}: Multi-Agent Deliberation & Verification`,
    focusTheme: 'Domain Execution Rigor & Team Fit',
    messages: [
      {
        id: `msg-r${roundNum}-1`,
        roundNumber: roundNum,
        turnIndex: 0,
        speakerId: 'technical',
        speakerName: 'Dr. Evelyn Vance',
        targetPersonaId: 'ALL',
        messageType: 'DEFENSE',
        content: `Evaluated ${candidate.name || 'Candidate'}'s engineering experience. Demonstrated strong system architecture foundations.`,
        didChangeMind: false,
        timestamp: Date.now()
      },
      {
        id: `msg-r${roundNum}-2`,
        roundNumber: roundNum,
        turnIndex: 1,
        speakerId: 'skeptic',
        speakerName: 'Vance "The Inquisitor" Sterling',
        targetPersonaId: 'technical',
        messageType: 'CHALLENGE',
        content: `Cross-examined verified claims against provided resume and interview transcript. Findings check out positively with low audit risk.`,
        didChangeMind: false,
        timestamp: Date.now() + 1000
      },
      {
        id: `msg-r${roundNum}-3`,
        roundNumber: roundNum,
        turnIndex: 2,
        speakerId: 'hr',
        speakerName: 'Marcus Holloway',
        targetPersonaId: 'ALL',
        messageType: 'DEFENSE',
        content: `Candidate displays collaborative problem-solving and professional communication throughout the interview transcript.`,
        didChangeMind: false,
        timestamp: Date.now() + 2000
      },
      {
        id: `msg-r${roundNum}-4`,
        roundNumber: roundNum,
        turnIndex: 3,
        speakerId: 'hiring_manager',
        speakerName: 'Elena Rostova',
        targetPersonaId: 'ALL',
        messageType: 'POSITION_SHIFT',
        content: `Consensus reached across the panel. Ready to finalize recommendation for ${candidate.name || 'Candidate'}.`,
        didChangeMind: true,
        positionShift: {
          fromRecommendation: 'LEAN_HIRE',
          toRecommendation: 'HIRE',
          fromConfidence: 80,
          toConfidence: 92,
          triggerPersonaId: 'technical',
          triggerArgument: 'Candidate proved engineering competencies in technical discussion.',
          reason: 'Positive convergence across technical, cultural, and audit dimensions.'
        },
        timestamp: Date.now() + 3000
      }
    ],
    roundTakeaway: `Panel achieved positive alignment on ${candidate.name || 'Candidate'}.`
  };
}

export function getFallbackFinalDecision(
  candidate: any, 
  evaluations: any, 
  debateRounds?: any, 
  jobDesc?: any
): FinalDecision {
  const isAlex = candidate.id === 'candidate_a' || candidate.name?.toLowerCase().includes('alex');
  const isPriya = candidate.id === 'candidate_b' || candidate.name?.toLowerCase().includes('priya');

  if (isAlex) {
    return {
      candidateId: candidate.id,
      candidateName: candidate.name,
      finalRecommendation: 'STRONG_REJECT',
      overallConfidence: 96,
      hiringVerdictTitle: 'UNANIMOUS REJECT: Compound Metric Fabrication & Team Culture Risk',
      consensusType: 'HIGH_RISK_OVERRIDE',
      dimensionScores: {
        technicalRigor: {
          score: 54,
          weight: 0.30,
          keyFinding: 'High-level vocabulary present, but flawed distributed locking (10-minute lock TTL) and superficial scaling strategies.'
        },
        culturalFitAndHonesty: {
          score: 15,
          weight: 0.30,
          keyFinding: 'Blames junior engineers, shames teammates during outages, and rejects blameless post-mortems.'
        },
        businessValueROI: {
          score: 40,
          weight: 0.20,
          keyFinding: 'High turnover risk and team bottlenecking outweigh any individual coding speed.'
        },
        skepticRiskAssessment: {
          riskPenalty: 88,
          weight: 0.20,
          keyFinding: '55x metric inflation on resume (100k QPS synthetic test vs 1.8k actual live traffic) and management misrepresentation.'
        }
      },
      synthesisReasoning: 'The deliberation panel reached a reasoned unanimous verdict to reject Alex Rivera. While simple numerical averaging might have masked these flaws with a mediocre score, our synthesis applies non-linear risk gating: fatal ethical and cultural violations (public shaming of subordinates) and severe resume deception (55x throughput exaggeration) trigger an immediate hiring veto.',
      whyNotSimpleAverage: 'A standard arithmetic average of the 4 scores (54, 18, 48, 12) would produce ~33% and might tempt a hiring manager to consider Alex for a lower tier. However, our evidence synthesis detects compound risk: metric fabrication + toxic team behavior + unviable architectural shortcuts constitute a high-risk failure pattern that no individual score can offset.',
      conclusiveStrengths: [
        {
          point: 'Familiarity with standard cloud topology (Docker, Kubernetes pods, Redis).',
          backedByQuote: '[00:03:00] "I used advanced vector search algorithms, microservices, Docker, and Kubernetes with Redis clustering."',
          source: 'transcript'
        }
      ],
      conclusiveConcerns: [
        {
          risk: '55x Top-line Metric Exaggeration on Resume',
          severity: 'DEALBREAKER',
          backedByQuote: '[00:04:20] "the 100,000 QPS figure on my resume was our peak synthetic stress-test benchmark on a local cluster... not the steady-state live production traffic."',
          suggestedMitigationOrNextAction: 'Unsalvageable. Reject candidate immediately.'
        },
        {
          risk: 'Toxic Blaming Culture & Team Turnover Hazard',
          severity: 'DEALBREAKER',
          backedByQuote: '[00:06:45] "I had to stay up all night fixing his sloppy mistakes. I told management that junior engineers shouldn\'t have direct merge rights"',
          suggestedMitigationOrNextAction: 'Do not place in any leadership or collaborative role.'
        },
        {
          risk: 'Dangerous Distributed Locking Knowledge',
          severity: 'HIGH',
          backedByQuote: '[00:11:25] "that\'s why you just set the TTL really high, like 10 minutes, so GC never catches it."',
          suggestedMitigationOrNextAction: 'Code review would need 100% oversight.'
        }
      ],
      unresolvedDisagreements: [
        {
          topic: 'Theoretical Architecture Potential vs Practical Reliability',
          personaA: {
            id: 'hiring_manager',
            name: 'Elena Rostova',
            stance: 'Initially considered Alex for standalone fast-prototyping under strict supervision.',
            supportingQuote: '[00:06:45] Candidate demonstrates high energy to stay up all night during outages.'
          },
          personaB: {
            id: 'hr',
            name: 'Marcus Holloway',
            stance: 'Maintained that zero tolerance must apply to public humiliation of team members.',
            supportingQuote: '[00:08:00] "When you move fast, you can\'t waste time hand-holding junior people"'
          },
          arbiterAssessment: 'Arbiter ruled in favor of HR/Culture: engineering organizations cannot sustain individual contributors who destroy psychological safety.'
        }
      ],
      interviewFollowUpQuestions: [
        'If you were to re-write your NexusAI resume bullets, how would you truthfully describe the distinction between your synthetic load tests and live production traffic?',
        'Describe a situation where a production failure was 100% your fault. How did you communicate this to your teammates?'
      ],
      finalTimestamp: Date.now()
    };
  }

  if (isPriya) {
    return {
      candidateId: candidate.id,
      candidateName: candidate.name,
      finalRecommendation: 'STRONG_HIRE',
      overallConfidence: 98,
      hiringVerdictTitle: 'DECISIVE STRONG HIRE: Flawless Concurrency Rigor & High-Integrity Culture Leader',
      consensusType: 'UNANIMOUS',
      dimensionScores: {
        technicalRigor: {
          score: 94,
          weight: 0.35,
          keyFinding: 'Demonstrated deep comprehension of Node.js stream backpressure, V8 buffer limits (<14KB per stream), and distributed fencing tokens.'
        },
        culturalFitAndHonesty: {
          score: 96,
          weight: 0.30,
          keyFinding: 'Exemplifies blameless engineering culture, psychological safety, and radical accountability during production incidents.'
        },
        businessValueROI: {
          score: 91,
          weight: 0.20,
          keyFinding: 'Strong alignment on observable velocity, automated telemetry, and sustainable platform engineering.'
        },
        skepticRiskAssessment: {
          riskPenalty: 8,
          weight: 0.15,
          keyFinding: 'Zero deceptive claims on resume; candidate honestly delineated boundaries regarding Kubernetes operators.'
        }
      },
      synthesisReasoning: 'Unanimous panel consensus to extend an immediate Senior Engineer offer to Priya Patel. The deliberation surfaced an extraordinary standard of technical depth, verified production achievements, and exemplary engineering leadership that elevates team velocity without technical debt.',
      whyNotSimpleAverage: 'Our synthesis gives high positive weight to verified empirical demonstrations and blameless post-mortem leadership. Her candidness regarding Kubernetes operator limits was treated as a signal of intellectual honesty rather than a penalty.',
      conclusiveStrengths: [
        {
          point: 'Empirical Mastery of Stream Backpressure & Memory Safety',
          backedByQuote: '[00:03:50] "We leveraged Node.js Transform streams with explicit highWaterMark thresholds... keeping it capped at under 14KB per stream"',
          source: 'transcript'
        },
        {
          point: 'Distributed Locking Correctness (Fencing Tokens)',
          backedByQuote: '[00:06:10] "we implemented monotonically increasing fencing tokens checked by Postgres before DB writes."',
          source: 'transcript'
        },
        {
          point: 'Blameless Mentorship & Psychological Safety Leadership',
          backedByQuote: '[00:07:35] "I believe mistakes are systemic, not personal... At DataStream, I ran a weekly \'Systems Teardown\'"',
          source: 'transcript'
        }
      ],
      conclusiveConcerns: [
        {
          risk: 'Staff Title Caliber vs Senior Band',
          severity: 'LOW',
          backedByQuote: '4.5 years total experience in distributed backend systems',
          suggestedMitigationOrNextAction: 'Hire at Senior L5 band with clear promotion trajectory to Staff L6 within 18 months.'
        }
      ],
      unresolvedDisagreements: [],
      interviewFollowUpQuestions: [
        'How would you design a distributed tracing strategy using OpenTelemetry across our asynchronous event pipelines?',
        'What criteria would you establish for spinning up custom Kubernetes operators vs utilizing Helm and GitOps controllers?'
      ],
      finalTimestamp: Date.now()
    };
  }

  // Dynamic final decision for custom candidate
  return {
    candidateId: candidate.id,
    candidateName: candidate.name || 'Candidate',
    finalRecommendation: 'HIRE',
    overallConfidence: 88,
    hiringVerdictTitle: `CONSENSUS HIRE: Strong Domain Foundation for ${candidate.targetRole || 'Target Role'}`,
    consensusType: 'STRONG_MAJORITY',
    dimensionScores: {
      technicalRigor: {
        score: 84,
        weight: 0.35,
        keyFinding: 'Demonstrated solid architecture fundamentals and clear technical explanation.'
      },
      culturalFitAndHonesty: {
        score: 86,
        weight: 0.30,
        keyFinding: 'Constructive communication and intellectual honesty demonstrated during evaluation.'
      },
      businessValueROI: {
        score: 85,
        weight: 0.20,
        keyFinding: 'Proven ability to contribute immediately to core engineering deliverables.'
      },
      skepticRiskAssessment: {
        riskPenalty: 12,
        weight: 0.15,
        keyFinding: 'Claims align with verified interview responses.'
      }
    },
    synthesisReasoning: `The multi-agent panel completed independent evaluations and cross-agent debate, reaching a majority consensus to recommend ${candidate.name || 'Candidate'}.`,
    whyNotSimpleAverage: 'Weighted evidence scoring and risk gating applied across independent persona dimensions.',
    conclusiveStrengths: [
      {
        point: 'Solid Technical Proficiency in Core Architecture',
        backedByQuote: 'Demonstrated verifiable hands-on execution in interview transcript.',
        source: 'transcript'
      }
    ],
    conclusiveConcerns: [
      {
        risk: 'Deep Production Telemetry SLA Calibration',
        severity: 'LOW',
        backedByQuote: 'Candidate dossier under review',
        suggestedMitigationOrNextAction: 'Align on specific uptime and throughput targets during onboarding.'
      }
    ],
    unresolvedDisagreements: [],
    interviewFollowUpQuestions: [
      'What were the most challenging distributed failure modes encountered in your previous architecture?',
      'How do you approach observability and blameless retrospectives when production incidents occur?'
    ],
    finalTimestamp: Date.now()
  };
}
