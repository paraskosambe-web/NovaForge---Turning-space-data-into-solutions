"use client";

import { useState } from "react";
import { Bot, LoaderCircle, Send, ShieldCheck, UserRound } from "lucide-react";
import type { NumericValue } from "@/lib/schema";
import type { AssistantAnswer } from "@/lib/ai/demo-cache";
import { PageTitle, Panel, Pill } from "@/components/ui";
import { ValueBadge } from "@/components/value-badge";
import { SourceLink } from "@/components/source-link";

type Message = { role: "user" | "assistant"; text: string; response?: AssistantAnswer };
const suggestions = [
  "Which tests are most relevant to a 30% O₂ lunar habitat?",
  "What records contain measured fuel concentration values?",
  "What oxygen level makes a fabric safe on Mars?",
];

export function AssistantClient() {
  const [audience, setAudience] = useState<"student" | "researcher">("student");
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");

  const submit = async (value = question) => {
    const text = value.trim();
    if (!text || busy) return;
    setQuestion(""); setError(""); setBusy(true);
    setMessages((current) => [...current, { role: "user", text }]);
    try {
      const response = await fetch("/api/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: text, audience }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "The assistant could not answer this request.");
      setMessages((current) => [...current, { role: "assistant", text: body.answer, response: body }]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Connection failed. Please try again.");
    } finally { setBusy(false); }
  };

  return <>
    <PageTitle eyebrow="SI assistant / 04" title="Ask the evidence" intro="Relevant PSI records are retrieved first. The model receives only those records, and unsupported questions get an explicit abstention." actions={<Pill tone="green"><ShieldCheck size={12} /> Grounded retrieval</Pill>} />
    <div className="assistant-layout">
      <Panel className="chat-panel" title="Investigation assistant" note="No account key is required in demo mode.">
        <div className="chat-toolbar"><div className="audience-toggle" role="group" aria-label="Assistant audience"><button className={audience === "student" ? "selected" : ""} onClick={() => setAudience("student")}>Student</button><button className={audience === "researcher" ? "selected" : ""} onClick={() => setAudience("researcher")}>Researcher / Engineer</button></div><span className="demo-mode-pill"><span /> DEMO MODE AVAILABLE</span></div>
        <div className="chat-scroll" aria-live="polite">
          {!messages.length && <div className="assistant-welcome"><span className="assistant-emblem"><Bot size={23} /></span><p className="eyebrow">NOVA SI / RETRIEVAL ACTIVE</p><h2>Start with a source-backed question</h2><p>Answers cite PSI investigation records. The assistant will say when its retrieved data cannot support a value or conclusion.</p><div className="suggestion-list">{suggestions.map((item) => <button key={item} onClick={() => submit(item)}>{item}</button>)}</div></div>}
          {messages.map((message, index) => <div className={`chat-message chat-${message.role}`} key={`${index}-${message.role}`}><span className="message-avatar">{message.role === "assistant" ? <Bot size={15} /> : <UserRound size={15} />}</span><div className="message-body"><div className="message-meta"><strong>{message.role === "assistant" ? "Nova SI" : "You"}</strong>{message.response && <span className={`mode-badge ${message.response.mode === "live" ? "mode-live" : "mode-demo"}`}>{message.response.mode === "live" ? "LIVE" : "DEMO (cached)"}</span>}{message.response?.abstained && <span className="abstain-badge">DATA GAP</span>}</div><p>{message.text}</p>{message.response?.values.length ? <div className="assistant-values">{message.response.values.map((value: NumericValue, fieldIndex) => <ValueBadge key={`${fieldIndex}-${value.record_id}`} field={value} compact />)}</div> : null}{message.response?.citations.length ? <div className="citation-row"><span>Sources used</span>{message.response.citations.map((citation) => <SourceLink key={`${citation.id}-${citation.record_id ?? ""}`} href={citation.source_url} label={`${citation.id}${citation.record_id ? " · table rows" : ""}`} />)}</div> : null}</div></div>)}
          {busy && <div className="chat-message chat-assistant"><span className="message-avatar"><Bot size={15} /></span><div className="message-body"><span className="typing-indicator"><LoaderCircle size={14} className="spin" /> Retrieving records and checking source coverage…</span></div></div>}
        </div>
        {error && <div role="alert" className="form-error">{error}</div>}
        <form className="chat-form" onSubmit={(event) => { event.preventDefault(); void submit(); }}><label className="sr-only" htmlFor="assistant-question">Ask a question</label><textarea id="assistant-question" className="field-textarea" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about an investigation, condition, or comparison…" maxLength={700} /><button type="submit" className="button button-primary" disabled={busy || question.trim().length < 4}><Send size={14} /> Ask SI</button></form>
      </Panel>
      <div className="stack assistant-side">
        <Panel title="How SI stays grounded"><ol className="step-list"><li><span>01</span><div><strong>Retrieve</strong><small>Search the loaded PSI record set first.</small></div></li><li><span>02</span><div><strong>Constrain</strong><small>Pass only those retrieved records to a live model.</small></div></li><li><span>03</span><div><strong>Cite or abstain</strong><small>Show sources and name missing fields.</small></div></li></ol></Panel>
        <Panel title="Try an unavailable answer"><p className="muted-copy">Ask for a fabric's exact safe oxygen threshold on Mars. The loaded PSI record summaries do not provide that combination.</p><button className="button button-quiet full-button" onClick={() => submit(suggestions[2])}>Run unavailable-data check <Send size={13} /></button></Panel>
        <div className="callout callout-warn"><ShieldCheck size={15} /><span>Assistant output is a research aid. It is not a certified fire-safety decision or NASA guidance.</span></div>
      </div>
    </div>
  </>;
}
