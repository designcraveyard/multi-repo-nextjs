'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { StreamEventPill } from './StreamEventPill';
import { PokemonCard } from './cards/PokemonCard';
import { EvolutionCard } from './cards/EvolutionCard';
import { TypeMatchupCard } from './cards/TypeMatchupCard';
import { TeamCard } from './cards/TeamCard';
import type {
  PokemonCardPayload,
  EvolutionCardPayload,
  TypeMatchupCardPayload,
  TeamCardPayload,
} from '@/lib/agents/types';

// --- Types ---

interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant' | 'event';
  content: string;
  agentName?: string;
  cards?: Array<{ type: string; data: unknown }>;
}

interface ChatMessageProps {
  message: ChatMessageData;
}

// --- Component ---

export function ChatMessage({ message }: ChatMessageProps) {
  // --- User bubble ---
  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-3">
        <div className="max-w-[75%] bg-[var(--surfaces-base-low-contrast)] rounded-2xl px-4 py-2">
          <p className="text-sm text-[var(--typography-primary)] whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  // --- Event pill (streaming state) ---
  if (message.role === 'event') {
    return (
      <div className="flex justify-start mb-3">
        <StreamEventPill label={message.content} />
      </div>
    );
  }

  // --- Assistant message ---
  return (
    <div className="flex flex-col items-start gap-2 mb-3">
      {/* Agent name label */}
      {message.agentName && (
        <span className="text-[10px] font-semibold text-[var(--typography-secondary)] uppercase tracking-wide px-1">
          {message.agentName}
        </span>
      )}

      {/* Markdown content */}
      {message.content && (
        <div className="prose prose-sm max-w-none text-[var(--typography-primary)] [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
      )}

      {/* Cards */}
      {message.cards && message.cards.length > 0 && (
        <div className="flex flex-col gap-2 w-full">
          {message.cards.map((card, index) => {
            switch (card.type) {
              case 'pokemon_card':
                return (
                  <PokemonCard
                    key={index}
                    data={card.data as PokemonCardPayload}
                  />
                );
              case 'evolution_card':
                return (
                  <EvolutionCard
                    key={index}
                    data={card.data as EvolutionCardPayload}
                  />
                );
              case 'type_matchup_card':
                return (
                  <TypeMatchupCard
                    key={index}
                    data={card.data as TypeMatchupCardPayload}
                  />
                );
              case 'team_card':
                return (
                  <TeamCard
                    key={index}
                    data={card.data as TeamCardPayload}
                  />
                );
              default:
                return null;
            }
          })}
        </div>
      )}
    </div>
  );
}
