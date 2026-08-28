import { AgentPersonaConfig, JobDescription, CandidateDossier } from '../types';

export const AGENT_PERSONAS: Record<string, AgentPersonaConfig> = {
  technical: {
    id: 'technical',
    name: 'Dr. Evelyn Vance',
    roleTitle: 'Principal Systems Architect',
    badge: 'Technical Depth',
    avatarColor: 'from-emerald-500 to-teal-700',
    bgLight: 'bg-emerald-50 text-emerald-950 border-emerald-200',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-700',
    accentHex: '#059669',
    voiceName: 'Kore',
    voicePitch: 1.0,
    voiceRate: 1.05,
    description: 'Scrutinizes algorithmic depth, distributed systems tradeoffs, concurrency, failure modes, and code-level reality vs superficial buzzwords.',
    focusAreas: ['System Architecture & Latency', 'Data Consistency & Concurrency', 'Production Outage Debugging', 'Concrete Code vs Buzzwords']
  },
  hr: {
    id: 'hr',
    name: 'Marcus Holloway',
    roleTitle: 'Head of People & Culture',
    badge: 'Culture & Integrity',
    avatarColor: 'from-amber-500 to-rose-600',
    bgLight: 'bg-amber-50 text-amber-950 border-amber-200',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-700',
    accentHex: '#d97706',
    voiceName: 'Puck',
    voicePitch: 0.95,
    voiceRate: 1.0,
    description: 'Evaluates emotional intelligence, credit attribution, team collaboration, blameless post-mortem mindset, honesty, and behavioral integrity.',
    focusAreas: ['Credit Sharing vs "I" Dominance', 'Conflict & Blameless Mindset', 'Humility & Growth Mindset', 'Cross-functional Communication']
  },
  hiring_manager: {
    id: 'hiring_manager',
    name: 'Elena Rostova',
    roleTitle: 'Director of Engineering',
    badge: 'Business Value & ROI',
    avatarColor: 'from-blue-600 to-indigo-800',
    bgLight: 'bg-indigo-50 text-indigo-950 border-indigo-200',
    borderColor: 'border-indigo-500',
    textColor: 'text-indigo-700',
    accentHex: '#4f46e5',
    voiceName: 'Zephyr',
    voicePitch: 1.05,
    voiceRate: 1.02,
    description: 'Weighs business delivery impact, team onboarding velocity, capability to ship under ambiguity, role level alignment, and compensation ROI.',
    focusAreas: ['Delivery Velocity & Pragmatism', 'Immediate Team Impact', 'Mentorship Capacity', 'Level & Role Fit']
  },
  skeptic: {
    id: 'skeptic',
    name: 'Vance "The Inquisitor" Sterling',
    roleTitle: 'Forensic Quality Auditor',
    badge: 'Contradictions & Red Flags',
    avatarColor: 'from-rose-600 to-red-900',
    bgLight: 'bg-rose-50 text-rose-950 border-rose-200',
    borderColor: 'border-rose-500',
    textColor: 'text-rose-700',
    accentHex: '#e11d48',
    voiceName: 'Fenrir',
    voicePitch: 0.85,
    voiceRate: 0.98,
    description: 'Cross-examines the resume against transcript, spots inflated metrics, uncovers deflected questions, highlights evasive answers, and flags dealbreakers.',
    focusAreas: ['Resume vs Transcript Contradictions', 'Inflated Metrics & Vanity Claims', 'Deflection of Direct Questions', 'Unsubstantiated High Claims']
  }
};

export const DEFAULT_JOB_DESCRIPTION: JobDescription = {
  id: 'jd-sr-platform-ai',
  title: 'Senior AI Platform & Distributed Systems Engineer',
  department: 'Core Infrastructure & AI Platform',
  level: 'Senior / Staff (L5/L6)',
  requiredSkills: [
    'Distributed Systems Design (High concurrency, message queues, microservices)',
    'TypeScript / Node.js & Python backend ecosystem',
    'Real-time streaming architectures (WebSockets, SSE, Kafka or Redis Pub/Sub)',
    'LLM Serving & RAG pipelines (latency optimization, caching, vector indexing)',
    'Production debugging of distributed race conditions and memory leaks'
  ],
  niceToHaveSkills: [
    'Kubernetes operator authoring',
    'gRPC service mesh integration',
    'Open source contribution to AI inference frameworks'
  ],
  responsibilities: [
    'Architect and scale the real-time multi-agent LLM execution engine under strict <200ms latency SLAs.',
    'Collaborate across product, QA, and security teams with clear, blameless communication.',
    'Mentor mid-level engineers and conduct rigorous, respectful code reviews.',
    'Own on-call rotations and lead blameless root-cause analysis for production incidents.'
  ],
  teamCultureValues: [
    'Extreme ownership with radical humility: praise the team for wins, own your own bugs.',
    'Evidence-based decision making over dogmatic opinions.',
    'Psychological safety and proactive mentorship.'
  ],
  rawText: `JOB DESCRIPTION: Senior AI Platform & Distributed Systems Engineer
Location: Remote / Hybrid | Department: Core AI Systems | Level: L5/L6 (Senior)

About the Role:
We are looking for a Senior AI Platform Engineer to design, deploy, and scale our next-generation distributed multi-agent execution platform. You will be responsible for building resilient real-time streaming backends, optimizing LLM inference orchestration, maintaining fault tolerance under high concurrency, and mentoring engineering team members.

Key Responsibilities:
- Architect, build, and maintain low-latency (<200ms) distributed orchestration engines for streaming AI agents.
- Design resilient event-driven data pipelines using Redis, Kafka, and Postgres with strict consistency guarantees.
- Diagnose and resolve complex production failure modes (distributed deadlocks, memory leaks, connection pool exhaustion).
- Foster a culture of blameless post-mortems, rigorous peer review, and transparent team mentorship.

Required Qualifications:
- 4+ years of professional backend software engineering with strong distributed systems foundations.
- Deep expertise in TypeScript/Node.js or Python, with solid grasp of concurrency models, async I/O, and event loops.
- Hands-on experience scaling real-time streaming architectures (WebSockets, SSE) and vector retrieval pipelines.
- Demonstrated track record of diagnosing real production outages with systematic root cause analysis.
- Strong empathetic communication, cross-functional collaboration, and humility.`
};

export const DEFAULT_CANDIDATES: CandidateDossier[] = [
  {
    id: 'candidate_a',
    name: 'Alex Rivera',
    appliedRole: 'Senior AI Platform Engineer',
    sourceFiles: {
      resumeFileName: '03_Resume_Alex_Rivera.pdf',
      transcriptFileName: '05_Transcript_Alex_Rivera.pdf'
    },
    resumeText: `ALEX RIVERA
Email: alex.rivera.dev@example.com | GitHub: github.com/arivera-architect | LinkedIn: linkedin.com/in/alex-rivera-systems
Summary: Seasoned Principal AI & Cloud Architect with 8+ years leading world-class distributed teams. Architected 100,000 QPS LLM inference platforms, managed 25+ engineers, and slashed AWS cloud bills by 85%.

PROFESSIONAL EXPERIENCE:

Lead Principal Architect | NexusAI Systems (2022 – Present)
- Solely architected and deployed enterprise AI streaming platform handling 100,000 QPS with 99.999% uptime.
- Directed global engineering division of 25 engineers across 3 timezones; drove 400% company valuation growth.
- Reduced multi-region cloud infrastructure expenditure by 85% ($1.2M annual savings) via custom LLM caching algorithms.
- Single-handedly designed zero-downtime distributed Redis/Kafka message fabric processing 50TB daily.

Senior Distributed Systems Engineer | HyperScale Cloud Labs (2019 – 2022)
- Built high-throughput microservices in Go and TypeScript serving 40M daily active users.
- Re-architected legacy monolithic database layer into sharded PostgreSQL with sub-10ms response times.
- Automated CI/CD pipelines and Kubernetes cluster provisioning across 12 production clusters.

EDUCATION & SKILLS:
- B.S. in Computer Science (Honors), Pacific State University (2019)
- Skills: Distributed Systems, LLM Serving, Kubernetes, Redis, Kafka, Node.js, Python, PostgreSQL, System Design`,
    transcriptText: `INTERVIEW TRANSCRIPT: Alex Rivera
Interviewer: Lead Interviewer | Candidate: Alex Rivera | Role: Senior AI Platform Engineer

[00:02:15] Interviewer: "Alex, thanks for joining. Let's dive straight into your recent experience at NexusAI. Your resume mentions you architected an AI platform handling 100,000 QPS. Could you walk us through the concurrency model, bottlenecks you encountered, and how you ensured data consistency across nodes?"

[00:03:00] Alex Rivera: "Yeah, absolutely. I essentially built the entire core engine from scratch. At 100k QPS, standard setups fall apart, so I used advanced vector search algorithms, microservices, Docker, and Kubernetes with Redis clustering. It was super fast because I optimized the caching layers."

[00:03:45] Interviewer: "Fascinating. When handling 100,000 queries per second of LLM generation, token streaming requires sustained open sockets. How did you handle socket exhaustion and connection pooling on your Node.js/Linux workers?"

[00:04:20] Alex Rivera: "Well, honestly, Node handles async events out of the box with the event loop. We just spun up multiple Kubernetes pods and threw more replicas at it whenever CPU spiked. To be totally clear, the 100,000 QPS figure on my resume was our peak synthetic stress-test benchmark on a local cluster with simulated stub endpoints before launch, not the steady-state live production traffic."

[00:05:10] Interviewer: "I see. In that synthetic test or production, what was the actual production throughput your service served to real paying users?"

[00:05:30] Alex Rivera: "In production, it was around 1,200 to 1,800 QPS across our tenant base. But my architecture was designed to theoretically hit 100k."

[00:06:15] Interviewer: "Understood. Can you tell me about a time a major production incident occurred under your watch, and how you resolved it with your team?"

[00:06:45] Alex Rivera: "Oh man, yeah. Last year our Redis cluster crashed during peak Black Friday traffic. The junior dev on on-call had pushed an unindexed query script that flooded the thread pool. I immediately stepped in, killed his process, and rolled back his commit. I had to stay up all night fixing his sloppy mistakes. I told management that junior engineers shouldn't have direct merge rights without me personally signing off."

[00:07:40] Interviewer: "Did you hold a post-mortem with the team to identify systemic gaps in CI/CD or staging checks?"

[00:08:00] Alex Rivera: "I just told the team what they did wrong. Honestly, I'm the top performer who writes 80% of the core code anyway. The other 24 people on the team mostly did documentation, minor UI tickets, and follow-ups. When you move fast, you can't waste time hand-holding junior people through endless retrospective meetings."

[00:09:10] Interviewer: "Your resume notes you managed 25 engineers. Were you their direct line manager conducting 1-on-1s, performance reviews, and career ladders?"

[00:09:35] Alex Rivera: "Well, the VP of Engineering officially did the HR paperwork and reviews, but I was the technical lead who told everyone what tasks to execute every morning in standup, so functionally they all reported to me."

[00:10:20] Interviewer: "Let's do a quick deep dive on distributed locking. If two worker nodes attempt to claim an LLM generation job simultaneously from a shared Redis queue, how do you prevent split-brain and race conditions?"

[00:10:45] Alex Rivera: "You just use Redis SETNX with a TTL timeout. It's basically bulletproof."

[00:11:05] Interviewer: "What happens if the worker node holding the lock encounters a long garbage collection pause that exceeds the TTL while it's still processing the LLM request?"

[00:11:25] Alex Rivera: "Well... that's why you just set the TTL really high, like 10 minutes, so GC never catches it. If the server crashes, you just wait out the 10 minutes or manually flush the keys in Redis."`
  },
  {
    id: 'candidate_b',
    name: 'Priya Sharma',
    appliedRole: 'Senior AI Platform Engineer',
    sourceFiles: {
      resumeFileName: '04_Resume_Priya_Sharma.pdf',
      transcriptFileName: '06_Transcript_Priya_Sharma.pdf'
    },
    resumeText: `PRIYA SHARMA
Email: priya.sharma.eng@example.com | GitHub: github.com/priyasharma-dev | Location: Seattle, WA
Summary: Software Engineer with 4.5 years of experience building resilient streaming data pipelines, real-time backend microservices, and LLM inference integrations. Passionate about distributed reliability, blameless team culture, and mentorship.

EXPERIENCE:

Senior Software Engineer | DataStream AI (2022 – Present)
- Core contributor to distributed LLM retrieval and streaming proxy serving 4,500 continuous streaming requests/sec at p99 latency <140ms.
- Implemented backpressure management and connection pooling in Node.js and Rust to resolve TCP socket leaks.
- Authored Redis Redlock distributed fencing token protocol to eliminate race conditions across 40 container workers.
- Mentored 3 junior/mid-level engineers; organized weekly architecture review and blameless incident learning sessions.

Backend Software Engineer | CloudVortex Labs (2020 – 2022)
- Built event-driven ingestion pipelines using Kafka, TypeScript, and PostgreSQL handling 15M events daily.
- Reduced database p95 query latency by 45% through composite index re-design and connection pool tuning.
- Led migration of batch ETL jobs to streaming microservices with comprehensive integration test coverage.

EDUCATION & SKILLS:
- B.S. in Computer Science, University of Washington (2020)
- Languages & Tech: TypeScript, Node.js, Python, Rust (intermediate), PostgreSQL, Redis, Kafka, Docker, Kubernetes (basics), Prometheus/Grafana`,
    transcriptText: `INTERVIEW TRANSCRIPT: Priya Sharma
Interviewer: Lead Interviewer | Candidate: Priya Sharma | Role: Senior AI Platform Engineer

[00:02:00] Interviewer: "Priya, welcome! Let's talk about your work at DataStream AI. Your resume mentions building a distributed streaming proxy handling 4,500 streaming requests/sec. Can you walk us through the architecture and how you handled backpressure when downstream clients had slow networks?"

[00:02:40] Priya Sharma: "Thank you! At DataStream AI, we were proxying token streams from multiple LLM providers to client browsers. The biggest challenge was backpressure: if a mobile client was on a 3G network reading 20 tokens/sec while the upstream LLM was streaming at 150 tokens/sec, unbuffered memory in our Node gateway would balloon rapidly and cause V8 heap crashes."

[00:03:35] Interviewer: "How specifically did you solve that in Node.js?"

[00:03:50] Priya Sharma: "We leveraged Node.js Transform streams with explicit \`highWaterMark\` thresholds. When the client socket buffer filled and \`write()\` returned false, our proxy paused the upstream SSE reader stream using \`stream.pause()\` and subscribed to the client's \`drain\` event before resuming. We also benchmarked memory per connection, keeping it capped at under 14KB per stream."

[00:04:40] Interviewer: "That's a very clean explanation. Can you tell me about a time you encountered a severe production bug or outage, and how you handled it?"

[00:05:05] Priya Sharma: "Yes. Early last year, during a high-traffic release, I introduced a race condition in our distributed Redis task lease. I used a standard TTL lock without fencing tokens. When a background job had a prolonged GC pause, the lock expired, another worker picked up the exact same generation task, and we duplicated LLM API costs for several customers over a 2-hour window."

[00:05:55] Interviewer: "How did you react once the alert fired?"

[00:06:10] Priya Sharma: "I immediately acknowledged the alert on PagerDuty, rolled back the release to the previous stable container image, and hopped on a triage call with our team. Once the service stabilized, I wrote a transparent, blameless post-mortem explaining exactly how the race condition manifested. I took full responsibility, and together with our junior dev, we implemented monotonically increasing fencing tokens checked by Postgres before DB writes. We also added automated chaos-engineering integration tests to simulate network partitions."

[00:07:15] Interviewer: "How do you approach working with junior engineers or team members who make mistakes?"

[00:07:35] Priya Sharma: "I believe mistakes are systemic, not personal. If a junior engineer pushes a breaking change to production, the failure is in our testing harnesses, CI checks, or review process—not the person. I love pair programming with junior engineers. At DataStream, I ran a weekly 'Systems Teardown' where we dissected real RFCs and failure logs in a safe, fun environment."

[00:08:30] Interviewer: "Your resume mentions Kubernetes (basics). How comfortable are you writing custom Kubernetes Operators or managing cluster networking?"

[00:08:50] Priya Sharma: "To be completely transparent, I am comfortable writing Helm charts, configuring deployments, ingress, and HPA (Horizontal Pod Autoscaling), but I have never written a custom Go Kubernetes Operator or debugged eBPF kernel routing. I'm very eager to learn that, and I've been studying Kubernetes controller internals in my spare time, but I wouldn't claim to be a Staff-level K8s administrator today."

[00:09:40] Interviewer: "What is your philosophy on balancing rapid shipping velocity versus code perfection?"

[00:10:00] Priya Sharma: "I think shipping fast without observability is false speed. I like to ship thin vertical slices with strict automated smoke tests and metrics in place from day one. That way you can iterate rapidly without accumulating crippling tech debt or on-call burnout."`
  }
];
