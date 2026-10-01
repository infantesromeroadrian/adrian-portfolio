import type { APIRoute } from "astro";
import { getSecret } from "astro:env/server";

import { handleChatAvailability, handleChatRequest } from "../../lib/portfolio-chat";

export const prerender = false;

function chatEnvironment() {
  return {
    OLLAMA_API_KEY: getSecret("OLLAMA_API_KEY"),
    OLLAMA_MODEL: getSecret("OLLAMA_MODEL"),
  };
}

export const GET: APIRoute = ({ request }) => (
  handleChatAvailability(request, { environment: chatEnvironment() })
);

export const POST: APIRoute = ({ request }) => (
  handleChatRequest(request, { environment: chatEnvironment() })
);
