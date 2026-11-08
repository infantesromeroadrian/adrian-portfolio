export type ProfessionalCase = Readonly<{
  slug: string;
  title: string;
  introduction: string;
  scope: string;
  problem: string;
  constraints: string;
  contribution: Readonly<{ personal: string; shared: string }>;
  decisions: readonly Readonly<{ title: string; description: string }>[];
  example: Readonly<{ situation: string; behavior: string }>;
  evidence: Readonly<{ reviewedOn: string; basis: string; limitation: string }>;
  previewAlt: string;
  relatedConceptualHref?: string;
}>;

// Public, anonymized accounts; kept separate from the conceptual studies and chat facts.
export const professionalCases: readonly ProfessionalCase[] = [
  {
    slug: "safe-copilot-recovery",
    title: "Safe recovery for a conversational AI copilot",
    introduction: "A blocked turn should not contaminate the next one. I implemented request-scoped safety checks and recovery logic that separates rejected context from valid conversation state.",
    scope: "Copilot application security, conversation context, regression testing",
    problem: "A copilot needs to reject requests about other conversations and recover from blocked turns without reusing intervened context.",
    constraints: "Recovery had to preserve the remaining valid state while failing closed when a request crossed the conversation boundary.",
    contribution: {
      personal: "I implemented request-scoped checks, deterministic handling of cross-conversation requests, context cleanup and regression tests for blocked turns. These code contributions were merged.",
      shared: "The wider team built the copilot platform. My contribution covered application context and recovery behavior within that shared system.",
    },
    decisions: [
      { title: "Check the request boundary first", description: "Handle cross-conversation requests deterministically before model invocation, rather than relying on the model to decline them." },
      { title: "Recover selectively", description: "Remove intervened context before reuse, retain the remaining valid state and fail closed. Recovery is part of the request lifecycle, not a reason to reuse a blocked turn." },
    ],
    example: {
      situation: "A user asks the copilot to discuss a different conversation.",
      behavior: "Reject that request before invoking the model. A subsequent valid turn can continue with the remaining valid state. This is an illustration of the recovery contract, not a live test in this portfolio.",
    },
    evidence: {
      reviewedOn: "2026-11-08",
      basis: "Merged implementation and documented regression tests were reviewed on 8 November 2026.",
      limitation: "The review did not establish a complete trace from the merged code to production runtime. The tests do not support a universal claim that information can never leak.",
    },
    previewAlt: "Simplified flow of request-scoped checks, rejected context removal and recovery with valid conversation state",
    relatedConceptualHref: "/architecture/protected-agent-runtime.html",
  },
  {
    slug: "state-preserving-guardrails",
    title: "Input and output safety controls with state preservation",
    introduction: "Blocking a response should not erase valid application state. I integrated input and output controls and corrected how blocked responses interact with state and consent.",
    scope: "Input and output controls, concurrency limits, privacy, state and consent",
    problem: "Safety intervention must suppress a blocked response while preserving the valid state and consent needed for the conversation to continue.",
    constraints: "The integration had to respect the existing application contract, concurrency limits and privacy requirements for diagnostics.",
    contribution: {
      personal: "I integrated input and output controls, concurrency limits and privacy-conscious diagnostics, and implemented the state and consent preservation fix. The integration and fix were merged.",
      shared: "The broader platform baseline was shared team work. My contribution was the consumer integration and its response-blocking behavior.",
    },
    decisions: [
      { title: "Keep both content boundaries explicit", description: "Apply controls to input and output rather than treating a successful input check as approval of the generated response." },
      { title: "Separate response content from valid state", description: "Do not return or retain blocked text. Preserve valid application state and consent independently so that a blocked response does not erase them." },
      { title: "Bound concurrency and diagnostics", description: "Include concurrency limits and privacy-conscious diagnostics in the integration, with documented checks for those contracts." },
    ],
    example: {
      situation: "A generated reply is blocked by the output control.",
      behavior: "Suppress the blocked text while retaining valid state and consent. The next valid turn can use that retained state. This static example illustrates the contract; it does not run the integration.",
    },
    evidence: {
      reviewedOn: "2026-11-08",
      basis: "Merged integration and fix, alongside documented contract, concurrency and privacy tests, were reviewed on 8 November 2026.",
      limitation: "Deployment of the consuming application was not verified in this review. This account establishes implementation evidence, not a production release claim.",
    },
    previewAlt: "Simplified input and output controls with a rejected-response branch and separate preservation of valid state and consent",
    relatedConceptualHref: "/architecture/shared-guardrail-platform.html",
  },
  {
    slug: "secure-rag-ingestion",
    title: "Secure incremental document ingestion for RAG",
    introduction: "An ingestion job needs to detect changed documents without turning failures into a second data channel. I hardened the loader's error handling and incremental change tracking.",
    scope: "Document loading, safe errors, incremental ingestion, persistence consistency",
    problem: "Document ingestion must distinguish changed content from unchanged content and report failures without exposing document text or raw diagnostic output.",
    constraints: "The existing job contract had to remain stable while error classification, version tracking and persistence stayed consistent.",
    contribution: {
      personal: "I hardened the loader with allowlisted safe error classification and suppression of raw exceptions, stdout and stderr in logs. I also implemented opaque ETag change tracking with a time-based fallback and persistence consistency. The code was merged.",
      shared: "The broader RAG system was a team effort. My work concerned the ingestion boundary and its job contract, rather than end-to-end retrieval quality.",
    },
    decisions: [
      { title: "Classify errors without forwarding raw output", description: "Expose safe, allowlisted failure categories while preserving the job contract. Raw exceptions and captured process output do not belong in those logs." },
      { title: "Treat a version marker as opaque", description: "Use ETags to track change without interpreting their contents. Retain a time-based fallback and keep persisted tracking consistent with processing." },
    ],
    example: {
      situation: "A scheduled ingestion job encounters an unchanged document, then a document with a changed version marker.",
      behavior: "Skip an unnecessary update for the unchanged version and process the changed one. If processing fails, return a classified error without document text. These are synthetic examples, not documents or logs from the system.",
    },
    evidence: {
      reviewedOn: "2026-11-08",
      basis: "Merged loader changes and documented regression coverage were reviewed on 8 November 2026.",
      limitation: "This evidence concerns ingestion behavior. It does not establish retrieval quality, latency improvements or cost savings for the broader RAG system.",
    },
    previewAlt: "Simplified document version check, incremental processing and safe error classification at the RAG ingestion boundary",
    relatedConceptualHref: "/architecture/guarded-rag-copilot.html",
  },
  {
    slug: "advisory-llm-evaluation",
    title: "An advisory LLM evaluation harness",
    introduction: "A fluent answer can still be outside an assistant's remit. I built an evaluation harness that keeps a role and scope veto separate from its four assessment dimensions.",
    scope: "LLM evaluation, role and scope checks, Amazon Bedrock, human calibration",
    problem: "An evaluator needs to assess generated responses without letting fluency override role and scope restrictions or letting untrusted inputs act as instructions.",
    constraints: "The judge is advisory. Generator and evaluator must remain separate, and human review and calibration are still necessary to interpret its output.",
    contribution: {
      personal: "I built the four-dimension judge harness, its fail-closed role and scope veto, untrusted-input delimiters, separate self-check dataset and Amazon Bedrock integration. The contribution was merged.",
      shared: "The harness supports a wider evaluation workflow. Human reviewers remain responsible for calibration and interpretation; the model judge does not replace their judgement.",
    },
    decisions: [
      { title: "Give role and scope a veto", description: "A failure of the role or scope check must veto the response, regardless of how it scores across the four dimensions." },
      { title: "Separate generation from evaluation", description: "Keep generator and evaluator distinct and delimit untrusted input so that content under review is not presented as evaluator instructions." },
      { title: "Keep the self-check separate", description: "Use a separate self-check dataset and retain human calibration. A small golden sample is an integration check, not broad validation of judge quality." },
    ],
    example: {
      situation: "An answer reads plausibly but goes beyond the assistant's permitted role or scope.",
      behavior: "The role and scope check vetoes it. Fluent wording cannot override that veto. This is a synthetic example of the evaluation rule, not a measured judgement from a live model.",
    },
    evidence: {
      reviewedOn: "2026-11-08",
      basis: "The merged harness and a historically documented Bedrock invocation on a small golden sample were reviewed on 8 November 2026.",
      limitation: "The sample does not establish general evaluator accuracy. Human calibration remains necessary, and this evidence does not establish a CI release-blocking control.",
    },
    previewAlt: "Simplified separation of generator and evaluator, four assessment dimensions, role and scope veto, and human review",
    relatedConceptualHref: "/architecture/evidence-led-operations.html",
  },
  {
    slug: "cloud-network-capacity",
    title: "Cloud-network capacity assessment for an AI migration",
    introduction: "Capacity recommendations need to reflect the workload a test actually reaches. I led the inventory, controlled development test and recommendations for an AI migration.",
    scope: "Cloud-network inventory, address capacity, interface observations, development testing",
    problem: "An AI migration needed an assessment of resource and IP-address availability, together with observations of network interfaces under a controlled test.",
    constraints: "A missing credential required an alternative test route. Requests were rejected early, limiting what the reached workload could demonstrate.",
    contribution: {
      personal: "I led the inventory, the controlled development test and the resulting recommendations, with attention to resource availability and interface observations.",
      shared: "Tooling was executed with team input. The assessment combined that shared execution with my analysis and recommendations.",
    },
    decisions: [
      { title: "Establish the available capacity", description: "Inventory resources and available addresses, then compare interface observations around the controlled development test." },
      { title: "Bound conclusions to the exercised route", description: "Document the alternative route and early request rejections. Use those constraints to limit the recommendation rather than extrapolating to production load." },
    ],
    example: {
      situation: "An assessor compares available addresses and interface observations before and after a controlled development test.",
      behavior: "Interpret the difference only against the workload that actually reached the system. Early rejections prevent a conclusion about sustained application load. This illustrative comparison contains no production traffic or capacity figures.",
    },
    evidence: {
      reviewedOn: "2026-11-08",
      basis: "Historical inventory, development-test documentation and recommendations were reviewed on 8 November 2026. No new load test was run for this case study.",
      limitation: "This was a development test only. The alternative route and early rejections limited its conclusions; it does not establish production capacity or a supported number of concurrent users.",
    },
    previewAlt: "Abstract network-capacity view showing subnet address availability, interface observations and the limits of a controlled development test",
  },
];

export function professionalCasePaths(slug: string) {
  return {
    page: `/work/${slug}/`,
    diagram: `/architecture/${slug}.html`,
    preview: `/architecture/${slug}-preview.webp`,
  } as const;
}

export const FEATURED_PROFESSIONAL_SLUG = "safe-copilot-recovery";
