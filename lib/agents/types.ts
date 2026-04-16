// lib/agents/types.ts
// Shared types for the multi-agent chatbot system.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Trace } from './trace';

// --- SSE Event Types ---

export type SSEEventType =
  | 'session'
  | 'agent_thinking'
  | 'tool_call'
  | 'text_delta'
  | 'pokemon_card'
  | 'evolution_card'
  | 'type_matchup_card'
  | 'team_card'
  | 'message_done'
  | 'done'
  | 'error';

// --- Pokemon Card Payloads ---

export interface PokemonStat {
  name: string;
  value: number;
}

export interface PokemonCardPayload {
  name: string;
  id: number;
  sprite: string;
  types: string[];
  stats: PokemonStat[];
  abilities: string[];
  height: number;
  weight: number;
}

export interface EvolutionStage {
  name: string;
  id: number;
  sprite: string;
  trigger: string;
}

export interface EvolutionCardPayload {
  chain: EvolutionStage[];
}

export interface TypeMultiplier {
  type: string;
  multiplier: number;
}

export interface TypeMatchupCardPayload {
  pokemon: string;
  weaknesses: TypeMultiplier[];
  resistances: TypeMultiplier[];
  immunities: string[];
}

export interface TeamMember {
  name: string;
  id: number;
  sprite: string;
  types: string[];
  role: string;
}

export interface TeamCoverage {
  uncovered: string[];
  doubleResisted: string[];
}

export interface TeamCardPayload {
  team: TeamMember[];
  coverage: TeamCoverage;
}

// --- Card Discriminated Union ---

export type CardPayload =
  | { type: 'pokemon_card'; data: PokemonCardPayload }
  | { type: 'evolution_card'; data: EvolutionCardPayload }
  | { type: 'type_matchup_card'; data: TypeMatchupCardPayload }
  | { type: 'team_card'; data: TeamCardPayload };

// --- Chat Message ---

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'event';
  content: string;
  agentName?: string;
  cards?: CardPayload[];
}

// --- Agent Context (per-request) ---

export interface AgentContext {
  userId: string;
  sessionId: string;
  profileSummary: string;
  conversationHistory: string;
  rawMemories: Array<{ memory_type: string; content: string; confidence: number }> | null;
  supabase: SupabaseClient;
  trace: Trace;
}

// --- Trace Types ---

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

export interface TraceSummary {
  traceId: string;
  userId: string;
  sessionId: string;
  totalMs: number;
  totalEvents: number;
  agentsUsed: string[];
  toolCallCount: number;
  sseEventCount: number;
  errorCount: number;
  errors: Array<{ phase: string; tool?: string; error: string }>;
}
