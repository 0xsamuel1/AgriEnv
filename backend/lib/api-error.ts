import { NextResponse } from "next/server";

interface APIErrorLike {
  status?: number;
  code?: string | null;
  message?: string;
  request_id?: string | null;
}

function isAPIErrorLike(error: unknown): error is APIErrorLike {
  return typeof error === "object" && error !== null;
}

export function openAIErrorResponse(error: unknown, fallback: string) {
  const apiError = isAPIErrorLike(error) ? error : {};
  const originalMessage = error instanceof Error ? error.message : fallback;
  const normalizedMessage = originalMessage.toLowerCase();
  const status = typeof apiError.status === "number" ? apiError.status : 500;

  console.error("OpenAI request failed", {
    status,
    code: apiError.code,
    requestId: apiError.request_id,
    message: originalMessage,
  });

  if (status === 429 && /credit|quota|billing/.test(normalizedMessage)) {
    return NextResponse.json(
      {
        error: "AI generation is unavailable because the API credit balance has been exhausted.",
        code: "ai_quota_exhausted",
        action: "Add credits in the OpenAI billing dashboard, then try again.",
      },
      { status: 429 }
    );
  }

  if (status === 429) {
    return NextResponse.json(
      {
        error: "The AI service is receiving too many requests. Please wait a moment and try again.",
        code: "ai_rate_limited",
      },
      { status: 429 }
    );
  }

  if (status === 401 || /api key|authentication/.test(normalizedMessage)) {
    return NextResponse.json(
      {
        error: "The AI service could not authenticate. Check the server API key configuration.",
        code: "ai_authentication_failed",
      },
      { status: 503 }
    );
  }

  if (normalizedMessage.includes("openai_api_key")) {
    return NextResponse.json(
      {
        error: "The AI service is not configured on this server.",
        code: "ai_not_configured",
      },
      { status: 503 }
    );
  }

  const responseStatus = status >= 400 && status < 600 ? status : 500;
  return NextResponse.json(
    {
      error: responseStatus >= 500 ? "The AI service is temporarily unavailable. Please try again." : fallback,
      code: apiError.code || "ai_request_failed",
    },
    { status: responseStatus }
  );
}
