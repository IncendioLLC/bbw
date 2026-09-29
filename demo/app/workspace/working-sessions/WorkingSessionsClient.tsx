"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { ReusableChatWindow } from "../../components/ReusableChatWindow";
import type { ChatMessage } from "../../components/ReusableChatWindow";

const sessionPrompts = [
  "Prepare our seed extension investor narrative",
  "Turn preclinical progress into diligence-ready answers",
  "Map the next FDA and CMC business risks",
  "Create a market-access evidence plan for our lead indication",
];

export function WorkingSessionsClient() {
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeSession, setActiveSession] = useState<{
    sessionId: string;
    title: string;
    messages: ChatMessage[];
  } | null>(null);

  const hasActiveChat = activeSession !== null;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const question = params.get("question")?.trim();

    if (!question) {
      return;
    }

    void openQuestion(question);
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  function startSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = draft.trim();

    if (question.length === 0 || isLoading) {
      return;
    }

    void openQuestion(question);
    setDraft("");
  }

  async function openQuestion(question: string) {
    const userMessage: ChatMessage = {
      speaker: "user",
      label: "You",
      text: question,
    };

    const sessionId = activeSession?.sessionId ?? createChatSessionId();

    setActiveSession((current) => ({
      sessionId: current?.sessionId ?? sessionId,
      title: current?.title ?? "New working session",
      messages: [...(current?.messages ?? []), userMessage],
    }));
    setIsLoading(true);

    const response = await askBBW(sessionId, [...(activeSession?.messages ?? []), userMessage]);

    setActiveSession((current) => ({
      sessionId: current?.sessionId ?? response.sessionId,
      title: current?.title ?? "New working session",
      messages: [
        ...(current?.messages ?? [userMessage]),
        {
          speaker: "agent",
          label: "BBW",
          text: response.answer,
        },
      ],
    }));
    setIsLoading(false);
  }

  if (hasActiveChat) {
    return (
      <ReusableChatWindow
        title={activeSession.title}
        sessionId={activeSession.sessionId}
        messages={activeSession.messages}
        draft={draft}
        inputId="follow-up-question"
        isLoading={isLoading}
        onDraftChange={setDraft}
        onSubmit={startSession}
        onNewSession={() => {
          setActiveSession(null);
          setDraft("");
          setIsLoading(false);
        }}
        showExportProject
      />
    );
  }

  return (
    <section className="session-home" aria-labelledby="session-home-title">
      <div className="session-mode-toggle" aria-label="Working mode">
        <button className="active" type="button">Chat</button>
        <a href="/workspace/working-sessions/plan-execution">Work</a>
      </div>
      <div className="session-home-center">
        <p className="clean-kicker">BBW business agent</p>
        <h2 id="session-home-title">What business decision are you working on?</h2>
        <form className="session-chatbar session-home-chatbar" onSubmit={startSession}>
          <label className="sr-only" htmlFor="session-question">
            Ask BBW a question
          </label>
          <input
            id="session-question"
            placeholder="Ask BBW about fundraising, FDA strategy, market access, IP, hiring..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button type="submit">Start session</button>
        </form>
        <div className="session-prompt-list">
          {sessionPrompts.map((prompt) => (
            <button type="button" key={prompt} onClick={() => void openQuestion(prompt)}>
              <span />
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

async function askBBW(sessionId: string, messages: ChatMessage[]) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sessionId,
        messages: messages.map((message) => ({
          role: message.speaker === "agent" ? "assistant" : "user",
          content: message.text,
        })),
      }),
    });

    const payload = (await response.json()) as {
      answer?: string;
      error?: string;
      sessionId?: string;
    };

    if (!response.ok || !payload.answer) {
      return {
        answer: payload.error ?? "BBW could not answer that yet. Please try again.",
        sessionId,
      };
    }

    return {
      answer: payload.answer,
      sessionId: payload.sessionId ?? sessionId,
    };
  } catch {
    return {
      answer: "BBW chat is temporarily unavailable. Please try again.",
      sessionId,
    };
  }
}

function createChatSessionId() {
  return `bbw-session-${window.crypto.randomUUID()}`;
}
