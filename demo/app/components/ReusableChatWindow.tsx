"use client";

import type { FormEvent } from "react";

import { FormattedMessage } from "./FormattedMessage";

export type ChatMessage = {
  speaker: "user" | "agent";
  label: string;
  text: string;
};

type ReusableChatWindowProps = {
  title: string;
  sessionId?: string;
  messages: ChatMessage[];
  draft: string;
  inputId: string;
  placeholder?: string;
  isLoading?: boolean;
  onDraftChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNewSession?: () => void;
  showExportProject?: boolean;
};

export function ReusableChatWindow({
  title,
  sessionId,
  messages,
  draft,
  inputId,
  placeholder = "Send a follow-up question...",
  isLoading = false,
  onDraftChange,
  onSubmit,
  onNewSession,
  showExportProject = false,
}: ReusableChatWindowProps) {
  return (
    <section className="active-session">
      <div className="chat-window panel">
        <div className="panel-heading">
          <div>
            <h2>{title}</h2>
            {sessionId ? <span className="session-id-label">{sessionId}</span> : null}
          </div>
          {onNewSession ? (
            <button type="button" onClick={onNewSession}>
              New session
            </button>
          ) : null}
        </div>
        <div className="chat-thread">
          {messages.map((message, index) => (
            <div className={`message ${message.speaker}`} key={`${message.label}-${index}`}>
              <strong>{message.label}</strong>
              <FormattedMessage text={message.text} />
            </div>
          ))}
          {isLoading ? (
            <div className="message agent pending">
              <strong>BBW</strong>
              <p>Thinking through the business context...</p>
            </div>
          ) : null}
        </div>
      </div>

      <form className="session-chatbar docked-chatbar compact-chatbar" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor={inputId}>
          Send a follow-up question
        </label>
        <input
          id={inputId}
          placeholder={placeholder}
          value={draft}
          disabled={isLoading}
          onChange={(event) => onDraftChange(event.target.value)}
        />
        {showExportProject ? (
          <button className="export-project-button" type="button">
            Export as project
          </button>
        ) : null}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Sending" : "Send"}
        </button>
      </form>
    </section>
  );
}
