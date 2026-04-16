// lib/agents/trace.ts
// Comprehensive debug tracing for agent pipeline.
// Each request gets a unique traceId that flows through all subsystems.
// Logs are structured JSON to console + optionally persisted to Supabase.

import { createClient } from '@supabase/supabase-js';

export interface TraceEvent {
  traceId: string;
  timestamp: string;
  phase: string;
  agent?: string;
  tool?: string;
  event: string;
  data?: Record<string, unknown>;
  durationMs?: number;
  error?: string;
}

export class Trace {
  readonly id: string;
  readonly userId: string;
  readonly sessionId: string;
  readonly startedAt: number;
  private events: TraceEvent[] = [];
  private timers: Map<string, number> = new Map();

  constructor(userId: string, sessionId: string) {
    this.id = `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    this.userId = userId;
    this.sessionId = sessionId;
    this.startedAt = Date.now();
  }

  // --- Core logging ---

  log(phase: string, event: string, data?: Record<string, unknown>, extra?: { agent?: string; tool?: string; durationMs?: number; error?: string }) {
    const entry: TraceEvent = {
      traceId: this.id,
      timestamp: new Date().toISOString(),
      phase,
      event,
      data,
      agent: extra?.agent,
      tool: extra?.tool,
      durationMs: extra?.durationMs,
      error: extra?.error,
    };
    this.events.push(entry);

    const elapsed = Date.now() - this.startedAt;
    const prefix = `[TRACE:${this.id}][${phase}${extra?.agent ? ':' + extra.agent : ''}${extra?.tool ? ':' + extra.tool : ''}]`;
    const timing = extra?.durationMs ? ` (${extra.durationMs}ms)` : '';
    const elapsedStr = ` +${elapsed}ms`;

    if (extra?.error) {
      console.error(`${prefix}${elapsedStr} ${event}${timing}`, data ? JSON.stringify(data, null, 0) : '');
    } else {
      console.log(`${prefix}${elapsedStr} ${event}${timing}`, data ? JSON.stringify(data, null, 0) : '');
    }
  }

  // --- Timer helpers ---

  startTimer(key: string) {
    this.timers.set(key, Date.now());
  }

  endTimer(key: string): number {
    const start = this.timers.get(key);
    if (!start) return 0;
    const duration = Date.now() - start;
    this.timers.delete(key);
    return duration;
  }

  // --- Convenience methods ---

  auth(event: string, data?: Record<string, unknown>) {
    this.log('Auth', event, data);
  }

  context(event: string, data?: Record<string, unknown>, durationMs?: number) {
    this.log('Context', event, data, { durationMs });
  }

  config(event: string, data?: Record<string, unknown>) {
    this.log('Config', event, data);
  }

  route(event: string, data?: Record<string, unknown>) {
    this.log('Route', event, data);
  }

  agent(agentName: string, event: string, data?: Record<string, unknown>, durationMs?: number) {
    this.log('Agent', event, data, { agent: agentName, durationMs });
  }

  toolCall(toolName: string, event: string, data?: Record<string, unknown>, durationMs?: number) {
    this.log('Tool', event, data, { tool: toolName, durationMs });
  }

  toolResult(toolName: string, event: string, data?: Record<string, unknown>, durationMs?: number) {
    this.log('ToolResult', event, data, { tool: toolName, durationMs });
  }

  sse(event: string, data?: Record<string, unknown>) {
    this.log('SSE', event, data);
  }

  card(event: string, data?: Record<string, unknown>) {
    this.log('Card', event, data);
  }

  map(event: string, data?: Record<string, unknown>) {
    this.log('Map', event, data);
  }

  memory(event: string, data?: Record<string, unknown>, durationMs?: number) {
    this.log('Memory', event, data, { durationMs });
  }

  engagement(event: string, data?: Record<string, unknown>, durationMs?: number) {
    this.log('Engagement', event, data, { durationMs });
  }

  perf(event: string, data?: Record<string, unknown>) {
    this.log('Perf', event, data);
  }

  error(phase: string, event: string, error: unknown, data?: Record<string, unknown>) {
    const msg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    this.log(phase, event, { ...data, errorStack: stack }, { error: msg });
  }

  // --- Summary ---

  summary(): Record<string, unknown> {
    const totalMs = Date.now() - this.startedAt;
    const toolCalls = this.events.filter(e => e.phase === 'Tool');
    const agents = [...new Set(this.events.filter(e => e.agent).map(e => e.agent))];
    const sseEvents = this.events.filter(e => e.phase === 'SSE');
    const errors = this.events.filter(e => e.error);

    return {
      traceId: this.id,
      userId: this.userId,
      sessionId: this.sessionId,
      totalMs,
      totalEvents: this.events.length,
      agentsUsed: agents,
      toolCallCount: toolCalls.length,
      sseEventCount: sseEvents.length,
      errorCount: errors.length,
      errors: errors.map(e => ({ phase: e.phase, tool: e.tool, error: e.error })),
    };
  }

  getEvents(): TraceEvent[] {
    return [...this.events];
  }

  // --- Persist to Supabase ---

  async persist(): Promise<void> {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } },
      );

      const { error } = await supabase.from('debug_traces').insert({
        trace_id: this.id,
        user_id: this.userId,
        session_id: this.sessionId,
        started_at: new Date(this.startedAt).toISOString(),
        total_ms: Date.now() - this.startedAt,
        summary: this.summary(),
        events: this.events,
      });

      if (error) {
        console.warn(`[TRACE:${this.id}] Persist failed (table may not exist):`, error.message);
      }
    } catch (err) {
      console.warn(`[TRACE:${this.id}] Persist error:`, err instanceof Error ? err.message : err);
    }
  }
}
