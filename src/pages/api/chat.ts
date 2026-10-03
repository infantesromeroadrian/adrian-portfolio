import type { APIContext, APIRoute } from "astro";
import { getSecret } from "astro:env/server";

import { handleChatAvailability, handleChatRequest } from "../../lib/portfolio-chat";

export const prerender = false;

function chatEnvironment() {
  return {
    OLLAMA_API_KEY: getSecret("OLLAMA_API_KEY"),
    OLLAMA_MODEL: getSecret("OLLAMA_MODEL"),
  };
}

// Vercel overwrites X-Forwarded-For at its edge, so the address Astro derives from it
// cannot be spoofed by the client. Astro throws when an adapter cannot provide it.
function clientAddressOf(context: APIContext): string | undefined {
  try {
    return context.clientAddress;
  } catch {
    return undefined;
  }
}

export const GET: APIRoute = ({ request }) => (
  handleChatAvailability(request, { environment: chatEnvironment() })
);

export const POST: APIRoute = (context) => (
  handleChatRequest(context.request, {
    environment: chatEnvironment(),
    clientAddress: clientAddressOf(context),
  })
);
