// lib/agents/index.ts
// Agent graph wiring — creates all agents and connects handoffs.

import { handoff } from '@openai/agents';
import { createTriageAgent } from './triage';
import { createPokedexExpert } from './pokedex-expert';
import { createTeamBuilder } from './team-builder';
import { createBattleStrategist } from './battle-strategist';
import { createMemoryAgent } from './memory-agent';
import { loadFromDb, getAgentConfig, shouldUseCodeFallback } from './config-cache';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AgentContext } from './types';
import type { Agent } from '@openai/agents';

interface AgentGraph {
  entryAgent: Agent<AgentContext>;
  memoryAgent: Agent<AgentContext>;
  agents: Map<string, Agent<AgentContext>>;
}

let cachedGraph: AgentGraph | null = null;

function buildCodeGraph(): AgentGraph {
  const triage = createTriageAgent();
  const pokedex = createPokedexExpert();
  const teamBuilder = createTeamBuilder();
  const battleStrat = createBattleStrategist();
  const memory = createMemoryAgent();

  // Wire handoffs: triage → specialists
  triage.handoffs = [
    handoff(pokedex, { toolNameOverride: 'route_to_pokedex', toolDescriptionOverride: 'Route to the Pokédex Expert for species info, abilities, evolution, and lore questions.' }),
    handoff(teamBuilder, { toolNameOverride: 'route_to_team_builder', toolDescriptionOverride: 'Route to the Team Builder for team composition and type coverage questions.' }),
    handoff(battleStrat, { toolNameOverride: 'route_to_battle_strategist', toolDescriptionOverride: 'Route to the Battle Strategist for matchup analysis, move recommendations, and battle strategy.' }),
  ];

  // Wire back-handoffs: specialists → triage
  const backHandoff = handoff(triage, { toolNameOverride: 'route_to_router', toolDescriptionOverride: 'Route back to the router for a different topic or new question.' });
  pokedex.handoffs = [backHandoff];
  teamBuilder.handoffs = [backHandoff];
  battleStrat.handoffs = [backHandoff];

  const agents = new Map<string, Agent<AgentContext>>();
  agents.set('poke-router', triage);
  agents.set('pokedex-expert', pokedex);
  agents.set('team-builder', teamBuilder);
  agents.set('battle-strategist', battleStrat);
  agents.set('memory-extractor', memory);

  return { entryAgent: triage, memoryAgent: memory, agents };
}

function applyDbOverrides(graph: AgentGraph, dbConfig: Awaited<ReturnType<typeof loadFromDb>>): void {
  if (!dbConfig) return;

  for (const agentConfig of dbConfig.agents) {
    const agent = graph.agents.get(agentConfig.slug);
    if (!agent) continue;

    if (agentConfig.model) agent.model = agentConfig.model;
    if (agentConfig.temperature !== null && agentConfig.temperature !== undefined) {
      agent.modelSettings = { ...agent.modelSettings, temperature: agentConfig.temperature };
    }
    if (agentConfig.system_prompt) {
      const originalInstructions = agent.instructions;
      agent.instructions = (ctx: AgentContext) => {
        const base = typeof originalInstructions === 'function'
          ? originalInstructions(ctx)
          : originalInstructions ?? '';
        return agentConfig.system_prompt + '\n\n' + base;
      };
    }
  }
}

export async function getAgentGraph(
  supabase?: SupabaseClient,
  cookieHeader?: string | null,
): Promise<AgentGraph> {
  // Build from code if not cached
  if (!cachedGraph) {
    cachedGraph = buildCodeGraph();
  }

  // Try DB overrides unless code fallback is requested
  if (supabase && !shouldUseCodeFallback(cookieHeader)) {
    const dbConfig = await loadFromDb(supabase);
    if (dbConfig) {
      applyDbOverrides(cachedGraph, dbConfig);
    }
  }

  return cachedGraph;
}

export function invalidateAgentGraph(): void {
  cachedGraph = null;
}
