export const PORTFOLIO_URL = "https://adrian-portfolio-three-wheat.vercel.app/";

type SecurityWriteUp = Readonly<{
  title: string;
  takeaway: string;
  scope: string;
  href: string;
}>;

export const securityWriteUps = [
  {
    title: "Doctrine Studio: A Prompt Is Not a Permission Boundary",
    takeaway: "Permission checks belong in the application. A model's instructions cannot replace them.",
    scope: "HTB lab analysis and reproduction",
    href: "https://medium.com/@infantesromeroadrian/doctrine-studio-a-prompt-is-not-a-permission-boundary-6d51785b9e4e",
  },
  {
    title: "Power Supply: Sensitive Data Stays Sensitive Across Turns",
    takeaway: "Data keeps its sensitivity throughout a conversation. Access checks must hold across turns.",
    scope: "HTB lab analysis and reproduction",
    href: "https://medium.com/@infantesromeroadrian/power-supply-sensitive-data-stays-sensitive-across-turns-c2c86ad4eead",
  },
  {
    title: "Neural Detonator: Models Can Carry Code",
    takeaway: "Treat ML artifacts as software: verify their provenance, inspect them, and isolate their execution.",
    scope: "HTB lab analysis and reproduction",
    href: "https://medium.com/@infantesromeroadrian/neural-detonator-un-modelo-tambi%C3%A9n-puede-esconder-c%C3%B3digo-9150c5660ba8",
  },
  {
    title: "Sigma Technology: A Partial Reproduction and Missing Evidence",
    takeaway: "Separate validated observations from missing evidence. The original input is unavailable, so the reproduction remains partial.",
    scope: "Partial HTB lab reproduction",
    href: "https://medium.com/@infantesromeroadrian/sigma-technology-a-partial-reproduction-and-missing-evidence-87bfe57eed8b",
  },
] satisfies readonly SecurityWriteUp[];

type ArchitectureStudy = Readonly<{
  title: string;
  problem: string;
  decision: string;
  limitation: string;
  scope: string;
  href: string;
  preview: string;
  previewAlt: string;
}>;

export const architectureStudies = [
  {
    title: "Guardrails as code",
    problem: "Teams need consistent guardrail policies and an explicit version for each application to use.",
    decision: "Define reusable profiles in Terraform and publish a versioned reference through SSM.",
    limitation: "Provisioning a policy does not prove its effectiveness or that an application applies it. Both need separate checks.",
    scope: "Amazon Bedrock Guardrails, Terraform, versioned SSM contract",
    href: "/architecture/guardrails-as-code.html",
    preview: "/architecture/guardrails-as-code-preview.webp",
    previewAlt: "Architecture preview for reusable guardrail profiles, Terraform delivery, and a versioned SSM contract",
  },
  {
    title: "Protected agent runtime",
    problem: "Model inputs and outputs need protection while tool permissions remain under application control.",
    decision: "Apply input and output checks around Bedrock, with deterministic authorization before tool execution.",
    limitation: "Guardrails assess content; they do not grant permission to use tools or access data.",
    scope: "Amazon Bedrock, Bedrock Guardrails, IAM, deterministic tool boundary",
    href: "/architecture/protected-agent-runtime.html",
    preview: "/architecture/protected-agent-runtime-preview.webp",
    previewAlt: "Architecture preview for input and output protection, Bedrock invocation, and a deterministic tool boundary",
  },
  {
    title: "Evidence-led operations",
    problem: "AI releases need evidence for promotion and clear signals for rollback without logging sensitive payloads.",
    decision: "Combine evaluation gates and telemetry without payloads with progressive release and explicit rollback.",
    limitation: "Release quality depends on evaluation coverage and chosen thresholds. Telemetry alone cannot demonstrate safety.",
    scope: "Evaluation gates, CloudWatch, progressive rollout, rollback",
    href: "/architecture/evidence-led-operations.html",
    preview: "/architecture/evidence-led-operations-preview.webp",
    previewAlt: "Architecture preview for evaluation gates, payload-free telemetry, progressive rollout, and rollback",
  },
  {
    title: "Shared guardrail platform",
    problem: "Agent teams in separate AWS accounts need the same content controls without rebuilding them in every project.",
    decision: "One Terraform pipeline deploys a versioned guardrail to each consumer account and publishes its contract in SSM. Agents resolve it at deploy time while enforcement moves from observe to pilot to enforce.",
    limitation: "A shared baseline cannot fit every use case. Project overlays need their own evaluation, and enabling enforcement does not prove that every consumer applies it.",
    scope: "Amazon Bedrock Guardrails, Terraform, multi-account SSM contract, staged enforcement",
    href: "/architecture/shared-guardrail-platform.html",
    preview: "/architecture/shared-guardrail-platform-preview.webp",
    previewAlt: "Architecture preview for a central guardrail module deployed to consumer accounts, a versioned SSM contract, and masked findings",
  },
  {
    title: "Guarded RAG copilot",
    problem: "A contact-center copilot must ground its suggestions in internal knowledge and case context while the operator stays in control.",
    decision: "An intake agent prepares the case in memory. A copilot on AgentCore retrieves from a knowledge base, checks its output with Bedrock Guardrails, and sends suggestion cards to the operator through an event bus.",
    limitation: "Suggestions are advice, not actions: the operator decides. Retrieval quality and guardrail thresholds need continuous evaluation, and redacted traces trade debugging detail for privacy.",
    scope: "Amazon Bedrock AgentCore Runtime and Memory, knowledge-base retrieval, Bedrock Guardrails, Kafka, Langfuse",
    href: "/architecture/guarded-rag-copilot.html",
    preview: "/architecture/guarded-rag-copilot-preview.webp",
    previewAlt: "Architecture preview for an intake agent, case memory, a guarded copilot, an event bus to the operator desk, and redacted tracing",
  },
] satisfies readonly ArchitectureStudy[];
