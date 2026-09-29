type IncomingMessage = {
  role?: string;
  content?: string;
};

const BBW_SYSTEM_PROMPT = [
  "You are BBW, an AI business agent for biomedical startup companies.",
  "Your users are scientists and technical founders who need clear business guidance.",
  "Focus on fundraising, investor diligence, regulatory strategy, market access, business development, hiring, company operations, IP strategy, and project planning.",
  "Be concrete, structured, and practical. Ask for missing company context when needed.",
  "Do not provide medical advice or clinical treatment recommendations.",
].join(" ");

export async function POST(request: Request) {
  let body: { messages?: IncomingMessage[]; sessionId?: string };

  try {
    body = (await request.json()) as { messages?: IncomingMessage[]; sessionId?: string };
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const messages = normalizeMessages(body.messages);
  const sessionId = normalizeSessionId(body.sessionId);

  if (messages.length === 0) {
    return Response.json({ error: "At least one message is required." }, { status: 400 });
  }

  const apiKey = readOpenAIKey();

  if (!apiKey) {
    return Response.json({
      answer: buildLocalBBWAnswer(messages.at(-1)?.content ?? ""),
      sessionId,
      mode: "local",
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: readModelName(),
        instructions: BBW_SYSTEM_PROMPT,
        input: messages.map((message) => ({
          role: message.role === "assistant" ? "assistant" : "user",
          content: message.content,
        })),
        max_output_tokens: 700,
      }),
    });

    const payload = (await response.json()) as OpenAIResponsePayload;

    if (!response.ok) {
      return Response.json(
        {
          error:
            payload.error?.message ??
            "BBW could not reach the model provider. Please try again.",
        },
        { status: response.status },
      );
    }

    return Response.json({
      answer: extractOutputText(payload) ?? buildLocalBBWAnswer(messages.at(-1)?.content ?? ""),
      sessionId,
      mode: "openai",
    });
  } catch {
    return Response.json(
      {
        error: "BBW chat service is unavailable right now. Please try again.",
      },
      { status: 502 },
    );
  }
}

function normalizeSessionId(sessionId: string | undefined) {
  const normalized = typeof sessionId === "string" ? sessionId.trim() : "";

  if (/^bbw-session-[a-z0-9-]{8,}$/i.test(normalized)) {
    return normalized;
  }

  return `bbw-session-${crypto.randomUUID()}`;
}

function normalizeMessages(messages: IncomingMessage[] | undefined) {
  return (messages ?? [])
    .map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: typeof message.content === "string" ? message.content.trim() : "",
    }))
    .filter((message) => message.content.length > 0)
    .slice(-12);
}

function readOpenAIKey() {
  return process.env.OPENAI_API_KEY;
}

function readModelName() {
  return process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
}

function buildLocalBBWAnswer(question: string) {
  const normalized = question.toLowerCase();

  if (normalized.includes("fund") || normalized.includes("investor") || normalized.includes("seed")) {
    return "For fundraising, BBW would frame the work around four tracks: milestone clarity, evidence quality, capital need, and investor objections. Start by defining the next value inflection point, the data package needed to support it, the runway required to reach it, and the top five diligence questions investors will ask.";
  }

  if (normalized.includes("fda") || normalized.includes("regulatory") || normalized.includes("ind")) {
    return "For regulatory strategy, BBW would first separate scientific uncertainty from agency uncertainty. Build a pre-IND question list around indication rationale, patient population, biomarker strategy, toxicology package, CMC readiness, and the specific decision you need FDA feedback to unlock.";
  }

  if (normalized.includes("market") || normalized.includes("payer") || normalized.includes("access")) {
    return "For market access, BBW would compare patient need, current standard of care, payer evidence expectations, pricing constraints, and launch sequence. The key output should be an evidence plan that supports both approval and reimbursement.";
  }

  return "BBW can help turn this into an operating plan. I would start by clarifying your company stage, lead program, next milestone, time constraint, cash runway, and the business decision you need to make. Then we can convert the answer into a project, investor memo, checklist, or decision brief.";
}

type OpenAIResponsePayload = {
  output_text?: string;
  error?: {
    message?: string;
  };
  output?: Array<{
    content?: Array<{
      text?: string;
      type?: string;
    }>;
  }>;
};

function extractOutputText(payload: OpenAIResponsePayload) {
  if (payload.output_text) {
    return payload.output_text;
  }

  return payload.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter(Boolean)
    .join("\n")
    .trim();
}
