"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { ReusableChatWindow } from "./components/ReusableChatWindow";
import type { ChatMessage } from "./components/ReusableChatWindow";

type PublicChatEntryProps = {
  suggestions: string[];
};

type AuthMode = "login" | "register";

export function PublicAuthActions() {
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const isRegister = authMode === "register";

  function enterWorkspace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const companyNameInput = String(form.get("companyName") ?? "").trim();
    const companyName = companyNameInput || companyNameFromEmail(email);

    window.localStorage.setItem(
      "bbw-company-session",
      JSON.stringify({
        companyName,
        email,
        stage: isRegister ? "New workspace" : "Company workspace",
      }),
    );
    window.location.assign("/workspace");
  }

  return (
    <>
      <nav className="public-nav" aria-label="Primary navigation">
        <button type="button" onClick={() => setAuthMode("login")}>
          Login
        </button>
        <button className="button primary" type="button" onClick={() => setAuthMode("register")}>
          Register
        </button>
      </nav>

      {authMode ? (
        <div className="auth-backdrop" role="presentation" onMouseDown={() => setAuthMode(null)}>
          <section
            className="auth-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="dialog-close"
              type="button"
              aria-label="Close login dialog"
              onClick={() => setAuthMode(null)}
            >
              ×
            </button>
            <p className="eyebrow">Company workspace</p>
            <h2 id="auth-title">{isRegister ? "Create your BBW account" : "Log in to BBW"}</h2>
            <form className="auth-form" onSubmit={enterWorkspace}>
              <label htmlFor="company-email">Company email</label>
              <input
                id="company-email"
                name="email"
                type="email"
                placeholder="founder@company.com"
                required
              />
              <label htmlFor="company-password">Password</label>
              <input
                id="company-password"
                name="password"
                type="password"
                placeholder="Enter password"
                required
              />
              {isRegister ? (
                <>
                  <label htmlFor="company-name">Company name</label>
                  <input id="company-name" name="companyName" placeholder="Company name" required />
                </>
              ) : null}
              <button type="submit">{isRegister ? "Create account" : "Log in"}</button>
            </form>
            <button
              className="auth-switch"
              type="button"
              onClick={() => setAuthMode(isRegister ? "login" : "register")}
            >
              {isRegister ? "Already have an account? Log in" : "New company? Register"}
            </button>
          </section>
        </div>
      ) : null}
    </>
  );
}

function companyNameFromEmail(email: string) {
  const domain = email.split("@")[1]?.split(".")[0];

  if (!domain) {
    return "Company workspace";
  }

  return `${domain.charAt(0).toUpperCase()}${domain.slice(1)} Bio`;
}

export function PublicChatEntry({ suggestions }: PublicChatEntryProps) {
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeChat, setActiveChat] = useState<{
    sessionId: string;
    title: string;
    messages: ChatMessage[];
  } | null>(null);

  function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void openQuestion(draft);
  }

  async function openQuestion(questionInput: string) {
    const question = questionInput.trim();

    if (!question || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      speaker: "user",
      label: "You",
      text: question,
    };

    const sessionId = activeChat?.sessionId ?? createChatSessionId();

    setActiveChat((current) => ({
      sessionId: current?.sessionId ?? sessionId,
      title: current?.title ?? "BBW business chat",
      messages: [...(current?.messages ?? []), userMessage],
    }));
    setDraft("");
    setIsLoading(true);

    const response = await askBBW(sessionId, [...(activeChat?.messages ?? []), userMessage]);

    setActiveChat((current) => ({
      sessionId: current?.sessionId ?? response.sessionId,
      title: current?.title ?? "BBW business chat",
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

  if (activeChat) {
    return (
      <ReusableChatWindow
        title={activeChat.title}
        sessionId={activeChat.sessionId}
        messages={activeChat.messages}
        draft={draft}
        inputId="public-follow-up-question"
        isLoading={isLoading}
        onDraftChange={setDraft}
        onSubmit={submitQuestion}
        onNewSession={() => {
          setActiveChat(null);
          setDraft("");
        }}
        showExportProject
      />
    );
  }

  return (
    <>
      <form className="gemini-chatbar" onSubmit={submitQuestion}>
        <label className="sr-only" htmlFor="question">
          Ask BBW a business question
        </label>
        <input
          id="question"
          name="question"
          placeholder="Ask about fundraising, FDA strategy, IP, market access, hiring..."
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button type="submit" aria-label="Start chat">
          Start
        </button>
      </form>

      <div className="clean-suggestions" aria-label="Suggested prompts">
        {suggestions.map((suggestion) => (
          <button type="button" key={suggestion} onClick={() => void openQuestion(suggestion)}>
            {suggestion}
          </button>
        ))}
      </div>
    </>
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
