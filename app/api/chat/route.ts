// app/api/chat/route.ts
// Main SSE streaming endpoint for the multi-agent chat pipeline.
// Authenticates, loads context, runs the agent graph, streams events to the client.

import { NextRequest } from 'next/server';
import { run, RunItemStreamEvent, RunAgentUpdatedStreamEvent, RunHandoffOutputItem, RunToolCallItem, RunToolCallOutputItem, RunMessageOutputItem } from '@openai/agents';
import { authenticateRequest, createAuthenticatedClient } from '@/lib/auth/api-auth';
import { getAgentGraph } from '@/lib/agents';
import { loadAgentContext } from '@/lib/agents/context';
import { Trace } from '@/lib/agents/trace';
import {
  createSession,
  saveChatMessage,
  setSessionTitle,
} from '@/lib/chat/sessions';

// --- Runtime config ---

export const runtime = 'nodejs';
export const maxDuration = 60;

// --- SSE helpers ---

function makeWriter() {
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  const write = async (event: string, data: unknown): Promise<void> => {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    await writer.write(encoder.encode(payload));
  };

  const close = () => writer.close();

  return { readable, write, close };
}

// --- POST handler ---

export async function POST(req: NextRequest): Promise<Response> {
  // 1. Authenticate
  const auth = await authenticateRequest(req);
  if (auth.error) return auth.error;
  const { userId } = auth;

  // 2. Parse body
  let message: string;
  let incomingSessionId: string | undefined;

  try {
    const body = await req.json();
    message = body?.message;
    incomingSessionId = body?.sessionId;
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing message' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 3. Create trace + resolve session
  const sessionId = incomingSessionId ?? (await createSession(userId));
  const trace = new Trace(userId, sessionId);
  trace.route('request_received', { hasSessionId: !!incomingSessionId, messageLength: message.length });

  // 4. Open SSE stream immediately so the client gets headers fast
  const { readable, write, close } = makeWriter();

  const cookieHeader = req.headers.get('cookie');
  const supabase = await createAuthenticatedClient(req);

  // 5. Run the pipeline asynchronously — the response is already returned below
  (async () => {
    try {
      // Emit session info first
      await write('session', { sessionId });

      // Load context and agent graph in parallel
      trace.startTimer('setup');
      const [agentContext, graph] = await Promise.all([
        loadAgentContext(userId, sessionId, supabase, trace),
        getAgentGraph(supabase, cookieHeader),
      ]);
      const setupMs = trace.endTimer('setup');
      trace.route('setup_complete', { setupMs });

      // 6. Stream the agent run
      let fullText = '';
      let lastAgentName = '';

      trace.startTimer('agent_run');

      const stream = await run(
        graph.entryAgent,
        [{ role: 'user', content: message }],
        {
          stream: true,
          context: agentContext,
        },
      );

      for await (const event of stream) {
        // --- Text streaming (OpenAI raw model events) ---
        if (event.type === 'raw_model_stream_event') {
          const chunk = event.data as Record<string, unknown> | undefined;

          // OpenAI chat completion delta
          const choices = chunk?.choices as Array<{ delta?: { content?: string } }> | undefined;
          const token = choices?.[0]?.delta?.content;
          if (token) {
            fullText += token;
            await write('text_delta', { token });
          }
        }

        // --- Run item events ---
        if (event instanceof RunItemStreamEvent) {
          const { item } = event;

          // Final text output from a message item
          if (item instanceof RunMessageOutputItem) {
            const content = (item.rawItem as unknown as { content?: Array<{ type: string; text?: string }> })?.content;
            const textContent = content?.find((c) => c.type === 'output_text' || c.type === 'text');
            // If text hasn't been accumulated via deltas, capture it here
            if (textContent?.text && !fullText) {
              fullText = textContent.text;
            }
          }

          // Tool call starting
          if (item instanceof RunToolCallItem) {
            const rawItem = item.rawItem as unknown as { name?: string };
            const toolName = rawItem?.name ?? 'unknown';
            trace.toolCall(toolName, 'tool_call_start');
            await write('tool_call', { label: `Using ${toolName}…`, toolName });
          }

          // Tool call result — detect card-shaped payloads
          if (item instanceof RunToolCallOutputItem) {
            const rawOutput: unknown = item.output;
            let parsed: Record<string, unknown> | null = null;

            // Output may be a string, a JSON object, or a wrapper with {text} / {output}
            if (typeof rawOutput === 'string') {
              try { parsed = JSON.parse(rawOutput); } catch { /* not JSON */ }
            } else if (rawOutput && typeof rawOutput === 'object') {
              const asRecord = rawOutput as Record<string, unknown>;
              // Try unwrapping common shapes
              if (typeof asRecord.text === 'string') {
                try { parsed = JSON.parse(asRecord.text); } catch { /* not JSON */ }
              } else if (typeof asRecord.output === 'string') {
                try { parsed = JSON.parse(asRecord.output); } catch { /* not JSON */ }
              } else {
                // Treat the object itself as the payload
                parsed = asRecord;
              }
            }

            // Also check rawItem.output for raw JSON text
            if (!parsed) {
              const rawItem = item.rawItem as unknown as { output?: string | { text?: string } };
              const ro = rawItem?.output;
              if (typeof ro === 'string') {
                try { parsed = JSON.parse(ro); } catch { /* not JSON */ }
              } else if (ro && typeof ro === 'object' && typeof ro.text === 'string') {
                try { parsed = JSON.parse(ro.text); } catch { /* not JSON */ }
              }
            }

            if (parsed) {
              trace.card('tool_output_parsed', { keys: Object.keys(parsed).slice(0, 8) });

              if (parsed.sprite && parsed.stats) {
                trace.card('pokemon_card');
                await write('pokemon_card', parsed);
              } else if (parsed.chain) {
                trace.card('evolution_card');
                await write('evolution_card', parsed);
              } else if (parsed.weaknesses && parsed.pokemon) {
                trace.card('type_matchup_card');
                await write('type_matchup_card', parsed);
              } else if (parsed.team) {
                trace.card('team_card');
                await write('team_card', parsed);
              }
            } else {
              trace.card('tool_output_unparseable', { outputType: typeof rawOutput });
            }
          }

          // Agent handoff
          if (item instanceof RunHandoffOutputItem) {
            const targetAgentName = item.targetAgent?.name ?? 'specialist';
            trace.route('handoff', { targetAgent: targetAgentName });
            await write('tool_call', { label: `Routing to ${targetAgentName}…`, agentName: targetAgentName });
          }
        }

        // --- Agent switch ---
        if (event instanceof RunAgentUpdatedStreamEvent) {
          lastAgentName = event.agent?.name ?? lastAgentName;
          trace.agent(lastAgentName, 'agent_switch');
          await write('agent_thinking', {});
        }
      }

      // Capture final output if not accumulated via deltas
      const finalOutput = (stream as unknown as { finalOutput?: unknown }).finalOutput;
      if (!fullText && typeof finalOutput === 'string') {
        fullText = finalOutput;
      }

      const agentRunMs = trace.endTimer('agent_run');
      trace.agent(lastAgentName, 'agent_run_complete', { textLength: fullText.length }, agentRunMs);

      // 7. Signal completion
      await write('message_done', { fullText, agentName: lastAgentName });
      await write('done', {});
      close();

      // 8. Background tasks (fire-and-forget)
      saveChatMessage(sessionId, 'user', message).catch(console.error);
      saveChatMessage(sessionId, 'assistant', fullText, { agent_name: lastAgentName }).catch(console.error);
      setSessionTitle(sessionId, message).catch(console.error);

      // Memory extraction — pass the conversation as a plain string to avoid
      // AssistantMessageItem content-array type constraints
      run(
        graph.memoryAgent,
        `User: ${message}\nAssistant: ${fullText}`,
        { context: { ...agentContext, userId } },
      ).catch(console.error);

      // Persist trace
      trace.persist().catch(console.error);

    } catch (err) {
      trace.error('Chat', 'pipeline_error', err);
      await write('error', {
        message: err instanceof Error ? err.message : 'Unknown error',
      }).catch(() => {});
      close();
    }
  })();

  // Return SSE response immediately — pipeline runs above concurrently
  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Content-Encoding': 'none',
      'X-Trace-Id': trace.id,
    },
  });
}
