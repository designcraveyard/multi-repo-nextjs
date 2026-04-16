// lib/agents/config-cache.ts
// DB-driven agent configuration with 5-min TTL and code fallback.

import type { SupabaseClient } from '@supabase/supabase-js';

interface CachedAgentConfig {
  id: string;
  slug: string;
  name: string;
  model: string;
  system_prompt: string | null;
  temperature: number;
  is_entry_point: boolean;
  is_background: boolean;
}

interface CachedToolDef {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  parameters_schema: unknown;
}

interface CachedHandoff {
  source_agent_id: string;
  target_agent_id: string;
  tool_description_override: string | null;
  sort_order: number;
}

interface ConfigCache {
  agents: CachedAgentConfig[];
  tools: CachedToolDef[];
  agentTools: Array<{ agent_id: string; tool_id: string }>;
  handoffs: CachedHandoff[];
  lastLoaded: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cache: ConfigCache | null = null;

export function isStale(): boolean {
  if (!cache) return true;
  return Date.now() - cache.lastLoaded > CACHE_TTL_MS;
}

export function invalidateCache(): void {
  cache = null;
}

export async function loadFromDb(supabase: SupabaseClient): Promise<ConfigCache | null> {
  if (cache && !isStale()) return cache;

  try {
    const [agentsRes, toolsRes, agentToolsRes, handoffsRes] = await Promise.all([
      supabase.from('agent_configs').select('*'),
      supabase.from('tool_definitions').select('*'),
      supabase.from('agent_tools').select('agent_id, tool_id'),
      supabase.from('agent_handoffs').select('*').order('sort_order'),
    ]);

    if (agentsRes.error || toolsRes.error || agentToolsRes.error || handoffsRes.error) {
      console.warn('[config-cache] DB load failed, using code fallback');
      return null;
    }

    cache = {
      agents: agentsRes.data ?? [],
      tools: toolsRes.data ?? [],
      agentTools: agentToolsRes.data ?? [],
      handoffs: handoffsRes.data ?? [],
      lastLoaded: Date.now(),
    };

    return cache;
  } catch {
    console.warn('[config-cache] DB load error, using code fallback');
    return null;
  }
}

export function getAgentConfig(slug: string): CachedAgentConfig | undefined {
  return cache?.agents.find((a) => a.slug === slug);
}

export function getToolsForAgent(agentId: string): string[] {
  if (!cache) return [];
  const toolIds = cache.agentTools
    .filter((at) => at.agent_id === agentId)
    .map((at) => at.tool_id);
  return cache.tools
    .filter((t) => toolIds.includes(t.id))
    .map((t) => t.slug);
}

export function getHandoffsForAgent(agentId: string): CachedHandoff[] {
  if (!cache) return [];
  return cache.handoffs.filter((h) => h.source_agent_id === agentId);
}

export function shouldUseCodeFallback(cookieHeader?: string | null): boolean {
  if (!cookieHeader) return false;
  return cookieHeader.includes('agent-code-fallback=true');
}
